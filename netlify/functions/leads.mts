import type { Config } from '@netlify/functions';
import { eq } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { leads, responses } from '../../db/schema.js';
import { requireRole, unauthorized, logAudit } from '../../lib/admin-auth.js';

// GET lists diagnostic-portal responses — staff-only, this is the data behind
// the admin dashboard's Leads tab.
// POST accepts a simple lead capture from the main contact form / pilot program
// form and stays public, since prospects submit it before ever logging in.
export default async (req: Request) => {

  if (req.method === 'GET') {
    const auth = await requireRole(['admin', 'viewer', 'sdr']);
    if (!auth.ok) return unauthorized(auth.status);

    const url = new URL(req.url);
    const isExport = url.searchParams.get('export') === 'csv';

    // CSV export and full PII/qualification-answer visibility are admin-only;
    // viewers get a redacted, aggregate-friendly shape meant only to validate
    // that capture is working, not to reach or profile a lead.
    if (isExport && !auth.user.roles.includes('admin')) return unauthorized(403);

    const canSeeSensitive = auth.user.roles.includes('admin') || auth.user.roles.includes('sdr');

    const all = await db.select().from(responses).orderBy(responses.createdAt);
    const shaped = all.reverse().map((r) => {
      const base = {
        id: r.id,
        form_token: r.formToken,
        company_name: r.companyName,
        contact_name: r.contactName,
        nda_accepted: r.ndaAccepted,
        status: r.status,
        created_at: r.createdAt,
        updated_at: r.updatedAt,
      };
      if (!canSeeSensitive) return base;
      return {
        ...base,
        email: r.email,
        phone_personal: r.phonePersonal,
        phone_corporate: r.phoneCorporate,
        answers: r.answers,
        notes: r.notes,
        registration_id: r.registrationHash,
      };
    });

    await logAudit(
      auth.user,
      isExport ? 'export_csv' : 'list_leads',
      'lead',
      undefined,
      { count: shaped.length },
    );

    return Response.json(shaped);
  }

  if (req.method === 'POST') {
    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return Response.json({ status: 'error', detail: 'JSON inválido' }, { status: 400 });
    }

    const nome = String(body.nome ?? '').trim();
    const empresa = String(body.empresa ?? '').trim();
    const email = String(body.email ?? '').trim();
    const segmento = String(body.segmento ?? '').trim();

    if (!nome || !empresa || !email || !segmento) {
      return Response.json(
        { status: 'error', detail: 'Nome, empresa, e-mail e segmento são obrigatórios.' },
        { status: 422 },
      );
    }

    const record = {
      nome,
      empresa,
      email,
      segmento,
      telefone: body.telefone ? String(body.telefone) : null,
      cargo: body.cargo ? String(body.cargo) : null,
      plano: body.plano ? String(body.plano) : null,
      frota: body.frota ? String(body.frota) : null,
      dor: body.dor ? String(body.dor) : null,
      source: body.source ? String(body.source) : null,
    };

    const [existing] = await db.select().from(leads).where(eq(leads.email, email));

    const [saved] = existing
      ? await db.update(leads).set(record).where(eq(leads.email, email)).returning()
      : await db.insert(leads).values(record).returning();

    return Response.json({
      status: 'success',
      lead_id: saved.id,
      created_at: saved.createdAt,
    });
  }

  return new Response('Method Not Allowed', { status: 405 });
};

export const config: Config = {
  path: '/api/leads',
};
