import type { Config } from '@netlify/functions';
import { eq } from 'drizzle-orm';
import { getDb } from '../../db/client';
import { leads, responses } from '../../db/schema';

// GET lists diagnostic-portal responses (used by the admin dashboard's Leads tab).
// POST accepts a simple lead capture from the main contact form / pilot program form.
export default async (req: Request) => {
  const db = getDb();

  if (req.method === 'GET') {
    const all = await db.select().from(responses).orderBy(responses.createdAt);
    const shaped = all.reverse().map((r) => ({
      id: r.id,
      form_token: r.formToken,
      company_name: r.companyName,
      contact_name: r.contactName,
      email: r.email,
      phone_personal: r.phonePersonal,
      phone_corporate: r.phoneCorporate,
      nda_accepted: r.ndaAccepted,
      answers: r.answers,
      registration_id: r.registrationHash,
      created_at: r.createdAt,
    }));
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
