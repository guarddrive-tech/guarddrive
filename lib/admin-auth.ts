import { getUser } from '@netlify/identity';
import { db } from '../db/index.js';
import { auditLogs } from '../db/schema.js';

export type StaffRole = 'admin' | 'viewer' | 'sdr';

export type StaffUser = {
  id: string;
  email: string;
  roles: StaffRole[];
};

type AuthResult = { ok: true; user: StaffUser } | { ok: false; status: 401 | 403 };

// Every admin-panel endpoint is staffed by one of these three roles — assigned
// in the Netlify Identity dashboard (app_metadata.roles), never by user input.
export async function requireRole(allowed: StaffRole[]): Promise<AuthResult> {
  const user = await getUser();
  if (!user) return { ok: false, status: 401 };

  const roles = (user.roles ?? []) as StaffRole[];
  if (!roles.some((r) => allowed.includes(r))) {
    return { ok: false, status: 403 };
  }

  return { ok: true, user: { id: user.id, email: user.email ?? 'unknown', roles } };
}

export function unauthorized(status: 401 | 403) {
  const detail = status === 401 ? 'Autenticação necessária.' : 'Permissão insuficiente para esta ação.';
  return Response.json({ status: 'error', detail }, { status });
}

export async function logAudit(
  user: StaffUser,
  action: string,
  resourceType?: string,
  resourceId?: string | number,
  details?: Record<string, unknown>,
) {
  await db.insert(auditLogs).values({
    userEmail: user.email,
    userId: user.id,
    action,
    resourceType: resourceType ?? null,
    resourceId: resourceId != null ? String(resourceId) : null,
    details: details ?? null,
  });
}
