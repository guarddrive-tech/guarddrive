import type { Config, Context } from '@netlify/functions';
import { eq } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { responses } from '../../db/schema.js';
import { requireRole, unauthorized, logAudit } from '../../lib/admin-auth.js';

const VALID_STATUSES = ['novo', 'contatado', 'reuniao_agendada', 'piloto_fechado', 'descartado'];

// Single-lead operations for the admin panel: view, update pipeline status /
// notes, and LGPD-compliant deletion — all staff-only and audit-logged.
export default async (req: Request, context: Context) => {
  const id = Number(context.params.id);
  if (!Number.isInteger(id)) {
    return Response.json({ status: 'error', detail: 'ID de lead inválido.' }, { status: 400 });
  }

  if (req.method === 'GET') {
    const auth = await requireRole(['admin', 'viewer', 'sdr']);
    if (!auth.ok) return unauthorized(auth.status);

    const [lead] = await db.select().from(responses).where(eq(responses.id, id));
    if (!lead) return Response.json({ status: 'error', detail: 'Lead não encontrado.' }, { status: 404 });

    await logAudit(auth.user, 'view_lead', 'lead', id);

    const canSeeSensitive = auth.user.roles.includes('admin') || auth.user.roles.includes('sdr');
    if (canSeeSensitive) return Response.json(lead);

    // Viewer role: redact contact PII, qualification answers, internal notes
    // and the registration hash — keep only what confirms capture is working.
    const { email, phonePersonal, phoneCorporate, answers, notes, registrationHash, ...redacted } = lead;
    return Response.json(redacted);
  }

  if (req.method === 'PATCH') {
    const auth = await requireRole(['admin', 'sdr']);
    if (!auth.ok) return unauthorized(auth.status);

    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return Response.json({ status: 'error', detail: 'JSON inválido.' }, { status: 400 });
    }

    const update: Partial<typeof responses.$inferInsert> = { updatedAt: new Date() };
    if (typeof body.status === 'string') {
      if (!VALID_STATUSES.includes(body.status)) {
        return Response.json({ status: 'error', detail: 'Status inválido.' }, { status: 422 });
      }
      update.status = body.status;
    }
    if (typeof body.notes === 'string') {
      update.notes = body.notes;
    }

    const [updated] = await db.update(responses).set(update).where(eq(responses.id, id)).returning();
    if (!updated) return Response.json({ status: 'error', detail: 'Lead não encontrado.' }, { status: 404 });

    await logAudit(auth.user, 'update_lead', 'lead', id, { status: update.status, notes_changed: 'notes' in update });
    return Response.json({ status: 'success', lead: updated });
  }

  if (req.method === 'DELETE') {
    const auth = await requireRole(['admin']);
    if (!auth.ok) return unauthorized(auth.status);

    const anonymize = new URL(req.url).searchParams.get('mode') === 'anonymize';

    if (anonymize) {
      const [updated] = await db
        .update(responses)
        .set({
          companyName: '[dado removido]',
          contactName: '[dado removido]',
          email: `anonimizado-${id}@removido.local`,
          phonePersonal: null,
          phoneCorporate: null,
          answers: {},
          notes: null,
          status: 'descartado',
          updatedAt: new Date(),
        })
        .where(eq(responses.id, id))
        .returning();
      if (!updated) return Response.json({ status: 'error', detail: 'Lead não encontrado.' }, { status: 404 });

      await logAudit(auth.user, 'anonymize_lead', 'lead', id);
      return Response.json({ status: 'success', mode: 'anonymized' });
    }

    const [deleted] = await db.delete(responses).where(eq(responses.id, id)).returning();
    if (!deleted) return Response.json({ status: 'error', detail: 'Lead não encontrado.' }, { status: 404 });

    await logAudit(auth.user, 'delete_lead', 'lead', id);
    return Response.json({ status: 'success', mode: 'deleted' });
  }

  return new Response('Method Not Allowed', { status: 405 });
};

export const config: Config = {
  path: '/api/leads/:id',
};
