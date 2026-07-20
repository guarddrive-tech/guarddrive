import type { Config } from '@netlify/functions';
import { sql } from 'drizzle-orm';
import { getDb } from '../../db/client';
import { forms, responses } from '../../db/schema';

export default async (req: Request) => {
  if (req.method !== 'GET') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const db = getDb();

  const [{ count: activeForms }] = await db
    .select({ count: sql<number>`count(*)`.mapWith(Number) })
    .from(forms)
    .where(sql`${forms.status} = 'active'`);

  const [{ count: totalResponses }] = await db
    .select({ count: sql<number>`count(*)`.mapWith(Number) })
    .from(responses);

  const segmentRows = await db
    .select({ segment: forms.segment, count: sql<number>`count(*)`.mapWith(Number) })
    .from(forms)
    .groupBy(forms.segment);

  const segment_counts = Object.fromEntries(segmentRows.map((r) => [r.segment, r.count]));

  return Response.json({
    active_forms: activeForms,
    total_responses: totalResponses,
    segment_counts,
  });
};

export const config: Config = {
  path: '/api/dashboard/stats',
};
