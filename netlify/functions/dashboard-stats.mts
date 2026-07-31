import type { Config } from '@netlify/functions';
import { sql } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { forms, responses } from '../../db/schema.js';
import { requireRole, unauthorized } from '../../lib/admin-auth.js';

export default async (req: Request) => {
  if (req.method !== 'GET') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const auth = await requireRole(['admin', 'viewer', 'sdr']);
  if (!auth.ok) return unauthorized(auth.status);

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

  const statusRows = await db
    .select({ status: responses.status, count: sql<number>`count(*)`.mapWith(Number) })
    .from(responses)
    .groupBy(responses.status);
  const status_counts = Object.fromEntries(statusRows.map((r) => [r.status, r.count]));

  // Response volume for each of the last 8 weeks (oldest first), used for the
  // "Leads por Semana" trend line.
  const weeklyRows = await db
    .select({
      weekStart: sql<string>`date_trunc('week', ${responses.createdAt})::date`,
      count: sql<number>`count(*)`.mapWith(Number),
    })
    .from(responses)
    .where(sql`${responses.createdAt} >= now() - interval '8 weeks'`)
    .groupBy(sql`date_trunc('week', ${responses.createdAt})`)
    .orderBy(sql`date_trunc('week', ${responses.createdAt})`);

  return Response.json({
    active_forms: activeForms,
    total_responses: totalResponses,
    segment_counts,
    status_counts,
    weekly_trend: weeklyRows.map((r) => ({ week: r.weekStart, count: r.count })),
  });
};

export const config: Config = {
  path: '/api/dashboard/stats',
};
