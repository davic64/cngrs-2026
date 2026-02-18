-- Add support contact fields to settings table if they don't exist
ALTER TABLE "settings" ADD COLUMN IF NOT EXISTS "support_phone" text DEFAULT '+52 (555) 123-4567';
ALTER TABLE "settings" ADD COLUMN IF NOT EXISTS "support_email" text DEFAULT 'soporte@cngrs.mx';
ALTER TABLE "settings" ADD COLUMN IF NOT EXISTS "support_hours" text DEFAULT 'Lunes a Viernes, 9:00 AM - 6:00 PM';
