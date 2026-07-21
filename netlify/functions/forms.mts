import type { Config } from '@netlify/functions';
import { createHash } from 'node:crypto';
import { sql } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { forms, responses } from '../../db/schema.js';

function makeToken(target: string, segment: string) {
  const base = `${target}-${segment}-${new Date().toISOString()}-${Math.random()}`;
  return createHash('md5').update(base).digest('hex').slice(0, 12).toUpperCase();
}

export default async (req: Request) => {

  if (req.method === 'GET') {
    const rows = await db
      .select({
        id: forms.id,
        token: forms.token,
        name: forms.name,
        target: forms.target,
        segment: forms.segment,
        description: forms.description,
        status: forms.status,
        createdAt: forms.createdAt,
        responses: sql<number>`count(${responses.id})`.mapWith(Number),
      })
      .from(forms)
      .leftJoin(responses, sql`${responses.formToken} = ${forms.token}`)
      .groupBy(forms.id)
      .orderBy(forms.createdAt);
    return Response.json(rows.reverse());
  }

  if (req.method === 'POST') {
    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return Response.json({ status: 'error', detail: 'JSON inválido' }, { status: 400 });
    }

    const name = String(body.name ?? '').trim();
    const target = String(body.target ?? '').trim();
    const segment = String(body.segment ?? '').trim();
    const questions = Array.isArray(body.questions) ? body.questions : [];

    if (!name || !target || !segment || questions.length === 0) {
      return Response.json(
        { status: 'error', detail: 'Nome, alvo, segmento e ao menos uma pergunta são obrigatórios.' },
        { status: 422 },
      );
    }

    const token = makeToken(target, segment);

    const [saved] = await db
      .insert(forms)
      .values({
        token,
        name,
        target,
        segment,
        description: body.description ? String(body.description) : '',
        questions,
      })
      .returning();

    return Response.json({
      status: 'success',
      form_id: saved.id,
      token: saved.token,
      link: `/r/${saved.token}`,
    });
  }

  return new Response('Method Not Allowed', { status: 405 });
};

export const config: Config = {
  path: '/api/forms',
};
