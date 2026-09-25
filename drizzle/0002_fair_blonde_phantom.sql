CREATE TABLE "pending_registrations" (
	"id" text PRIMARY KEY NOT NULL,
	"data" jsonb NOT NULL,
	"password_hash" text NOT NULL,
	"payment_type" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"user_id" uuid,
	"error" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
