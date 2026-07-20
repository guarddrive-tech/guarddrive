import type { Config } from '@netlify/functions';
import { getDb } from '../../db/client';
import { telemetry } from '../../db/schema';

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

  const event = String(body.event ?? '').trim();
  const path = String(body.path ?? '').trim();
  if (!event || !path) {
    return Response.json({ status: 'error', detail: 'event e path são obrigatórios.' }, { status: 422 });
  }

  const db = getDb();
  await db.insert(telemetry).values({
    eventType: event,
    path,
    metadata: body.metadata ?? null,
  });

  return Response.json({ status: 'success' });
};

export const config: Config = {
  path: '/api/telemetry/event',
};
