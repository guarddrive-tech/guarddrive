CREATE TABLE "audit_logs" (
	"id" serial PRIMARY KEY,
	"user_email" text NOT NULL,
	"user_id" text,
	"action" text NOT NULL,
	"resource_type" text,
	"resource_id" text,
	"details" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "responses" ADD COLUMN "status" text DEFAULT 'novo' NOT NULL;--> statement-breakpoint
ALTER TABLE "responses" ADD COLUMN "notes" text;--> statement-breakpoint
ALTER TABLE "responses" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;