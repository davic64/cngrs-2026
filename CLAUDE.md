# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run dev          # Start Next.js dev server

# Linting & formatting (Biome, not ESLint/Prettier)
npm run lint         # Check with Biome
npm run format       # Auto-format with Biome

# Database migrations (Drizzle Kit)
npx drizzle-kit generate   # Generate migration from schema changes
npx drizzle-kit migrate    # Apply migrations to the database
npx drizzle-kit studio     # Open Drizzle Studio (DB browser)
```

There are no automated tests in this project.

## Environment Variables

Required in `.env`:
- `DATABASE_URL` — Neon PostgreSQL connection string
- `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_DOMAIN` — Cloudflare R2 storage
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` — Stripe payments
- `NEXT_PUBLIC_APP_URL` — Public base URL (used for Stripe redirect URLs)
- `GOOGLE_VISION_API_KEY` or `GOOGLE_APPLICATION_CREDENTIALS` — Google Cloud Vision (OCR for ID verification)

## Architecture Overview

**Next.js 16 App Router** project, fully in TypeScript, using Server Actions as the API layer (no separate REST API).

### Data Flow Pattern
All data mutations go through **Server Actions** in `src/app/actions/`. Pages are server components that pass data to `*Client.tsx` client components. The client components call server actions directly — there are no API routes except for the Stripe webhook.

### Key Architectural Decisions

**Authentication**: Cookie-based sessions only. The `user_session` cookie holds the user's UUID directly (no JWT). `getSessionUser()` in `auth.ts` reads this cookie and returns the full user object. There is no middleware protecting routes — the dashboard layout checks the session server-side and redirects if needed.

**Roles**: Two roles — `admin` and `user`. Admins are stored in the same `users` table with `role = 'admin'`. The dashboard layout redirects admins to `/admin/dashboard`.

**Forgot password flow**: User requests a reset via modal in the login page (`sendPasswordResetRequest()` in `password-reset.ts`) → sends a Telegram notification to admin. Admin generates a temporary password from the admin panel (`generateTemporaryPassword()` in `admin.ts`), which sets `passwordResetRequired = true` on the user and returns the temp password for the admin to share manually. When the user logs in with the temp password, the dashboard layout detects `passwordResetRequired = true` and redirects to `/auth/change-password`. That page (`ChangePasswordClient`) forces the user to set a new password, then clears the flag via `changePassword()` in `auth.ts`.

**File Storage**: All uploads go to **Cloudflare R2** (S3-compatible). `src/lib/storage.ts` contains all R2 logic. Files are organized into folders: `Perfil/`, `Identificación/`, `Carta Responsiva/`, `Pagos/`, `templates/`. The *Carta Responsiva* template lives at the fixed path `templates/carta-responsiva.pdf` in R2 (no DB tracking).

**Temporary file tracking**: During registration, files are uploaded to R2 before the user record exists. These are tracked in the `temporary_files` table with a `sessionId`. After successful registration, they are `confirmed`; if registration fails or is abandoned, they are `abandoned` and deleted. A cron job at `/api/cron/cleanup-temp-files` cleans up expired `pending` files after 24 hours.

**Payment flow (Stripe)**: `createCheckoutSession()` builds a Stripe Checkout session, embedding `userId`, `paymentType`, `baseAmount`, and `sessionId` in metadata. On success, the Stripe webhook at `/api/webhook/stripe` handles `checkout.session.completed`, inserts the payment record, and updates `registrationStatus`. During registration (no `userId` yet), the session passes `userId: "registration_pending"` — the actual user creation and payment insert happen in `registerUser()` after the client verifies the Stripe session with `verifyStripeSession()`.

**Database**: Drizzle ORM with Neon serverless PostgreSQL. Schema is the single source of truth at `src/db/schema.ts`. Migrations are in `drizzle/`. Use `db.query.*` (relational API) for reads with relations, and `db.insert/update/delete` for writes.

**OCR**: Google Cloud Vision is used during registration to verify the applicant's age from their ID document (`verifyDocumentAge()`). Adults over 29 are capped at 50 total (`ADULT_COMPANION_LIMIT`).

### Directory Structure

```
src/
  app/
    actions/          # All Server Actions (auth, admin, stripe, ocr, support, events, venue, notifications)
    admin/            # Admin panel pages (server components → pass data to components/admin/*)
    auth/             # Login, registration & change-password pages
    dashboard/        # User dashboard pages (server components → pass data to components/dashboard/*)
    api/
      webhook/stripe/ # Stripe webhook handler
      cron/           # Cleanup cron job
  components/
    admin/            # Admin *Client.tsx client components
    dashboard/        # User dashboard *Client.tsx client components
    ui/               # Shared UI primitives (Button, Input, Modal, Drawer, Select, etc.)
    ChatWidget.tsx    # Floating support chat widget (rendered globally)
  db/
    index.ts          # Drizzle client (Neon serverless)
    schema.ts         # All table definitions and relations
  lib/
    storage.ts        # Cloudflare R2 upload/delete logic
    utils.ts          # `cn()` utility (clsx + tailwind-merge)
```

### Registration Status Logic
- `pendiente` — registered, no validated payment
- `parcial` — at least one completed payment, but total paid < `settings.fullPaymentPrice`
- `completado` — total paid ≥ `settings.fullPaymentPrice`

The `settings` table (single row) controls prices, Stripe fees, bank info, and terms. Always read it with `db.query.settings.findFirst()`.
