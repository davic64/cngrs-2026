CREATE TYPE "public"."chat_status" AS ENUM('active', 'closed');--> statement-breakpoint
CREATE TYPE "public"."gender" AS ENUM('M', 'F', 'Otro');--> statement-breakpoint
CREATE TYPE "public"."message_sender" AS ENUM('visitor', 'admin');--> statement-breakpoint
CREATE TYPE "public"."payment_method" AS ENUM('tarjeta', 'transferencia', 'efectivo');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('pendiente', 'revision', 'completado', 'rechazado');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('admin', 'user');--> statement-breakpoint
CREATE TYPE "public"."registration_status" AS ENUM('pendiente', 'parcial', 'completado');--> statement-breakpoint
CREATE TYPE "public"."temp_file_status" AS ENUM('pending', 'confirmed', 'abandoned');--> statement-breakpoint
CREATE TABLE "agenda_days" (
	"id" serial PRIMARY KEY NOT NULL,
	"label" text NOT NULL,
	"date" text NOT NULL,
	"sort_order" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "emergency_contacts" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"phone" text NOT NULL,
	CONSTRAINT "emergency_contacts_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"speaker" text NOT NULL,
	"time" text NOT NULL,
	"location" text NOT NULL,
	"category" text NOT NULL,
	"day_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "health_info" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"allergies" text DEFAULT 'Ninguna',
	"conditions" text DEFAULT 'Ninguna',
	"medications" text DEFAULT 'Ninguno',
	"dosage_frequency" text DEFAULT 'N/A',
	CONSTRAINT "health_info_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "localities" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"state" text NOT NULL,
	"country" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"full_content" text NOT NULL,
	"type" text NOT NULL,
	"is_pinned" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"amount" integer NOT NULL,
	"type" text NOT NULL,
	"method" "payment_method" NOT NULL,
	"proof_url" text,
	"payment_status" "payment_status" DEFAULT 'pendiente' NOT NULL,
	"rejection_reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"full_payment_price" integer DEFAULT 1500 NOT NULL,
	"registration_fee_price" integer DEFAULT 500 NOT NULL,
	"stripe_percentage" text DEFAULT '3.6' NOT NULL,
	"stripe_fixed_fee" integer DEFAULT 3 NOT NULL,
	"terms_and_conditions" text,
	"price_deadline" timestamp,
	"bank_name" text DEFAULT 'BBVA',
	"bank_clabe" text DEFAULT '0123 4567 8901 2345 67',
	"bank_holder" text DEFAULT 'JIDI Internacional A.C.',
	"oxxo_card_number" text,
	"telegram_token" text,
	"telegram_chat_id" text,
	"support_phone" text DEFAULT '+52 (555) 123-4567',
	"support_email" text DEFAULT 'soporte@cngrs.mx',
	"support_hours" text DEFAULT 'Lunes a Viernes, 9:00 AM - 6:00 PM',
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "support_chats" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"visitor_name" text NOT NULL,
	"visitor_phone" text,
	"status" "chat_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "support_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"chat_id" uuid NOT NULL,
	"sender" "message_sender" NOT NULL,
	"message" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "temporary_files" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" text NOT NULL,
	"file_url" text NOT NULL,
	"file_type" text NOT NULL,
	"status" "temp_file_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"confirmed_at" timestamp,
	"expires_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"phone" text NOT NULL,
	"password" text NOT NULL,
	"role" "role" DEFAULT 'user' NOT NULL,
	"age" integer NOT NULL,
	"gender" "gender" NOT NULL,
	"shirt_size" text NOT NULL,
	"profile_photo_url" text,
	"document_url" text,
	"country" text NOT NULL,
	"state" text NOT NULL,
	"locality" text NOT NULL,
	"registration_status" "registration_status" DEFAULT 'pendiente' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_phone_unique" UNIQUE("phone")
);
--> statement-breakpoint
CREATE TABLE "venues" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"address" text NOT NULL,
	"description" text NOT NULL,
	"maps_url" text NOT NULL,
	"website_url" text,
	"services" text
);
--> statement-breakpoint
ALTER TABLE "emergency_contacts" ADD CONSTRAINT "emergency_contacts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "health_info" ADD CONSTRAINT "health_info_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_messages" ADD CONSTRAINT "support_messages_chat_id_support_chats_id_fk" FOREIGN KEY ("chat_id") REFERENCES "public"."support_chats"("id") ON DELETE cascade ON UPDATE no action;