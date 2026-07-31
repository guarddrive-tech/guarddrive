import type { UserLoginEvent } from '@netlify/functions';
import { db } from '../../db/index.js';
import { auditLogs } from '../../db/schema.js';

// LGPD audit trail: record every successful admin-panel login.
export default {
  async userLogin(event: UserLoginEvent) {
    await db.insert(auditLogs).values({
      userEmail: event.user.email ?? 'unknown',
      userId: event.user.id,
      action: 'login',
      resourceType: 'session',
      details: { roles: event.user.appMetadata?.roles ?? [] },
    });
  },
};
