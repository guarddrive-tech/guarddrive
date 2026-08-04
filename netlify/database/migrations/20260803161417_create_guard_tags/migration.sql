CREATE TABLE "guard_tags" (
	"id" serial PRIMARY KEY,
	"gtid" text NOT NULL UNIQUE,
	"status" text DEFAULT 'active' NOT NULL,
	"activated_at" timestamp DEFAULT now() NOT NULL,
	"replaced_by_gtid" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
