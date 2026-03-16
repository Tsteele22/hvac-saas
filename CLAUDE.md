# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with this repository.

## Commands

```bash
npm run dev          # Start dev server at localhost:3000
npm run build        # Production build
npm run lint         # ESLint
npm run type-check   # npx tsc --noEmit
```

## Architecture

Next.js 14 App Router SaaS for HVAC contractors. All routes under `src/app/`:

- `(auth)/` — login/signup pages (public)
- `(dashboard)/` — protected dashboard layout with sidebar nav
- `api/webhooks/twilio/` — inbound SMS handler (AI lead responder)
- `api/webhooks/stripe/` — subscription lifecycle events
- `api/quotes/generate/` — Claude quote generation endpoint
- `api/jobs/complete/` — marks job done, triggers 2-hr review timer
- `api/cron/send-reviews/` — Vercel cron job (runs every 5 min), sends pending review SMS

### Data flow

**AI Lead Responder**: Twilio webhook → `api/webhooks/twilio` → saves lead to DB → calls `lib/anthropic.generateLeadResponse()` → `lib/twilio.sendSMS()` → updates lead status. Must complete in < 90 seconds.

**Smart Quote Generator**: Dashboard form → `api/quotes/generate` → calls `lib/anthropic.generateQuotes()` → returns 3-tier JSON (good/better/best) → saved to `quotes` table.

**Review Requester**: Job marked complete via `api/jobs/complete` → sets `completed_at`. Vercel cron (`api/cron/send-reviews`) runs every 5 min, finds jobs where `completed_at` < 2 hours ago and `review_sent_at` IS NULL → sends SMS with `company.google_review_link`.

### Key libraries

- `src/lib/supabase/client.ts` — browser client (client components)
- `src/lib/supabase/server.ts` — server client (Server Components, Route Handlers)
- `src/lib/supabase/admin.ts` — service role client (webhooks only, bypasses RLS)
- `src/lib/anthropic.ts` — `generateLeadResponse()` and `generateQuotes()`
- `src/lib/twilio.ts` — `sendSMS()` and `validateTwilioSignature()`
- `src/lib/stripe.ts` — Stripe client + PLANS config

### Database (Supabase/PostgreSQL)

Tables: `companies`, `leads`, `quotes`, `jobs`. Schema in `supabase/migrations/001_initial_schema.sql`. All tables have RLS — users can only access their own company's data. Admin client (`supabaseAdmin`) used in webhook handlers to bypass RLS.

### Auth

Supabase Auth. Middleware (`src/middleware.ts`) protects `/dashboard`, `/leads`, `/quotes`, `/jobs`, `/settings`. Webhooks at `/api/webhooks/*` are excluded from auth middleware.

### Env vars

Required: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_PRICE_ID`, `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`, `ANTHROPIC_API_KEY`, `NEXT_PUBLIC_APP_URL`, `CRON_SECRET`.

Copy `.env.local.example` to `.env.local` and fill in values.
