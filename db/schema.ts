import { pgTable, serial, text, boolean, timestamp, jsonb } from 'drizzle-orm/pg-core';

// Legacy/simple lead capture — main contact form and pilot program form.
export const leads = pgTable('leads', {
  id: serial('id').primaryKey(),
  nome: text('nome').notNull(),
  empresa: text('empresa').notNull(),
  email: text('email').notNull().unique(),
  telefone: text('telefone'),
  cargo: text('cargo'),
  plano: text('plano'),
  segmento: text('segmento').notNull(),
  frota: text('frota'),
  dor: text('dor'),
  source: text('source'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Custom interviewer/diagnostic forms (form builder in the admin portal).
export const forms = pgTable('forms', {
  id: serial('id').primaryKey(),
  token: text('token').notNull().unique(),
  name: text('name').notNull(),
  target: text('target').notNull(),
  segment: text('segment').notNull(),
  description: text('description'),
  questions: jsonb('questions').notNull(),
  status: text('status').default('active').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Responses submitted through the dynamic diagnostic portal (?r={token}) —
// these are the "leads" managed in the admin backoffice.
export const responses = pgTable('responses', {
  id: serial('id').primaryKey(),
  formToken: text('form_token').notNull(),
  companyName: text('company_name').notNull(),
  contactName: text('contact_name').notNull(),
  email: text('email').notNull(),
  phonePersonal: text('phone_personal'),
  phoneCorporate: text('phone_corporate'),
  ndaAccepted: boolean('nda_accepted').default(false).notNull(),
  answers: jsonb('answers').notNull(),
  registrationHash: text('registration_hash'),
  // Pipeline status, set by staff from the admin panel.
  status: text('status').default('novo').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Page/event telemetry.
export const telemetry = pgTable('telemetry', {
  id: serial('id').primaryKey(),
  eventType: text('event_type').notNull(),
  path: text('path').notNull(),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// LGPD-compliant audit trail for the admin backoffice: who accessed or
// changed which lead, and when. Identity users live in Netlify Identity, so
// staff are referenced by email/id from their JWT rather than a local table.
export const auditLogs = pgTable('audit_logs', {
  id: serial('id').primaryKey(),
  userEmail: text('user_email').notNull(),
  userId: text('user_id'),
  action: text('action').notNull(), // login, view_lead, update_lead, delete_lead, export_csv, create_form
  resourceType: text('resource_type'),
  resourceId: text('resource_id'),
  details: jsonb('details'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// GuardDrive's own operational record of a physical GuardTag (NFC seal),
// keyed by its public GTID. This is a GuardDrive-local table, not a cache or
// projection of any UEAP on-chain registry — no such registry is deployed or
// reachable today. Kept intentionally minimal (see ADR-0001): no asset/vehicle
// data, no OFP/RF/trust-score columns until those capabilities actually exist.
export const guardTags = pgTable('guard_tags', {
  id: serial('id').primaryKey(),
  gtid: text('gtid').notNull().unique(),
  status: text('status').default('active').notNull(), // active | revoked | replaced
  activatedAt: timestamp('activated_at').defaultNow().notNull(),
  replacedByGtid: text('replaced_by_gtid'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
