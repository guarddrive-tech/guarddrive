CREATE TABLE "forms" (
	"id" serial PRIMARY KEY,
	"token" text NOT NULL UNIQUE,
	"name" text NOT NULL,
	"target" text NOT NULL,
	"segment" text NOT NULL,
	"description" text,
	"questions" jsonb NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "leads" (
	"id" serial PRIMARY KEY,
	"nome" text NOT NULL,
	"empresa" text NOT NULL,
	"email" text NOT NULL UNIQUE,
	"telefone" text,
	"cargo" text,
	"plano" text,
	"segmento" text NOT NULL,
	"frota" text,
	"dor" text,
	"source" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "responses" (
	"id" serial PRIMARY KEY,
	"form_token" text NOT NULL,
	"company_name" text NOT NULL,
	"contact_name" text NOT NULL,
	"email" text NOT NULL,
	"phone_personal" text,
	"phone_corporate" text,
	"nda_accepted" boolean DEFAULT false NOT NULL,
	"answers" jsonb NOT NULL,
	"registration_hash" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "telemetry" (
	"id" serial PRIMARY KEY,
	"event_type" text NOT NULL,
	"path" text NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
