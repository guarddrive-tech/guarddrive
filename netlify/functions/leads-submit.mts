import type { Config } from '@netlify/functions';
import { createHash } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { getDb } from '../../db/client';
import { responses, forms, leads } from '../../db/schema';

export default async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return Response.json({ status: 'error', detail: 'JSON inválido' }, { status: 400 });
  }

  const formToken = String(body.form_token ?? '').trim();
  const companyName = String(body.company_name ?? '').trim();
  const contactName = String(body.contact_name ?? '').trim();
  const email = String(body.email ?? '').trim();
  const answers = (body.answers ?? {}) as Record<string, unknown>;

  if (!formToken || !companyName || !contactName || !email) {
    return Response.json(
      { status: 'error', detail: 'Formulário, empresa, contato e e-mail são obrigatórios.' },
      { status: 422 },
    );
  }

  const db = getDb();

  // Internal integrity checksum of the submitted record — a real hash of the
  // stored data, not a blockchain transaction. Surfaced to users as a demo
  // registration reference only (see the diagnostic portal's "Demonstração" copy).
  const registrationHash =
    '0x' +
    createHash('sha256')
      .update(`${email}-${formToken}-${JSON.stringify(answers)}-${new Date().toISOString()}`)
      .digest('hex');

  const [saved] = await db
    .insert(responses)
    .values({
      formToken,
      companyName,
      contactName,
      email,
      phonePersonal: body.phone_personal ? String(body.phone_personal) : null,
      phoneCorporate: body.phone_corporate ? String(body.phone_corporate) : null,
      ndaAccepted: Boolean(body.nda_accepted),
      answers,
      registrationHash,
    })
    .returning();

  // Mirror into the legacy leads table so the segment breakdown stays accurate.
  const [formRecord] = await db.select().from(forms).where(eq(forms.token, formToken));
  const segmento = formRecord?.segment ?? 'desconhecido';
  const answerValues = Object.values(answers);

  const [existingLead] = await db.select().from(leads).where(eq(leads.email, email));
  const leadRecord = {
    nome: contactName,
    empresa: companyName,
    email,
    segmento,
    telefone: body.phone_corporate ? String(body.phone_corporate) : null,
    dor: answerValues.length ? String(answerValues[0]) : 'Preenchido via formulário dinâmico',
    source: 'diagnostic_portal',
  };
  if (existingLead) {
    await db.update(leads).set(leadRecord).where(eq(leads.email, email));
  } else {
    await db.insert(leads).values(leadRecord);
  }

  return Response.json({
    status: 'success',
    response_id: saved.id,
    registration_id: registrationHash,
    created_at: saved.createdAt,
  });
};

export const config: Config = {
  path: '/api/leads/submit',
};
