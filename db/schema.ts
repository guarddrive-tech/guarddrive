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

// Responses submitted through the dynamic diagnostic portal (?r={token}).
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
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Page/event telemetry.
export const telemetry = pgTable('telemetry', {
  id: serial('id').primaryKey(),
  eventType: text('event_type').notNull(),
  path: text('path').notNull(),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
