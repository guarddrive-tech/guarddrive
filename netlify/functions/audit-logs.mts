import type { Config } from '@netlify/functions';
import { and, desc, eq, gte, lte, sql } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { auditLogs } from '../../db/schema.js';
import { requireRole, unauthorized } from '../../lib/admin-auth.js';

// LGPD compliance: a filterable trail of every access to lead data (who
// viewed/edited/deleted/exported which lead, and when). This is exactly the
// "internal logic / sensitive insight" layer reserved for the admin role —
// SDRs and viewers never see it, including the per-lead status timeline.
export default async (req: Request) => {
  if (req.method !== 'GET') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const auth = await requireRole(['admin']);
  if (!auth.ok) return unauthorized(auth.status);

  const url = new URL(req.url);
  const resourceId = url.searchParams.get('resource_id');
  const userEmail = url.searchParams.get('user');
  const action = url.searchParams.get('action');
  const from = url.searchParams.get('from');
  const to = url.searchParams.get('to');

  const conditions = [];
  if (userEmail) conditions.push(eq(auditLogs.userEmail, userEmail));
  if (action) conditions.push(eq(auditLogs.action, action));
  if (resourceId) conditions.push(eq(auditLogs.resourceId, resourceId));
  if (from) conditions.push(gte(auditLogs.createdAt, new Date(from)));
  if (to) conditions.push(lte(auditLogs.createdAt, new Date(to)));

  const rows = await db
    .select()
    .from(auditLogs)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(auditLogs.createdAt))
    .limit(500);

  return Response.json(rows);
};

export const config: Config = {
  path: '/api/audit-logs',
};
