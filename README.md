# Event Campaign Tool

Internal tool for SidelineSwap Marketing & Event Ops: upload past trade-in
customers, create a campaign for an upcoming event, and send a personalized
invite email with a bonus code. Phase 1 scope — see the project brief for
what's intentionally left out (Metabase sync, event calendar integration,
multiple templates, reminder signups) for later phases.

## Stack

Next.js (App Router) · Supabase (Postgres) · NextAuth (Google SSO) · Resend
(transactional email) · Tailwind CSS · deployed on Vercel.

## What's here vs. what needs setup

The code is done, but three third-party accounts have to exist before
anything actually works end-to-end. Nothing in this repo can create those
accounts for you — **this is Brendan's part**:

1. **Supabase project** — a new project, with the SQL in
   `supabase/migrations/0001_init.sql` run against it (paste it into the
   Supabase SQL Editor, or use the Supabase CLI). Gives you
   `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.
2. **Resend account** — with `mail.sidelineswap.com` added and verified as
   a sending domain (SPF/DKIM/DMARC records added wherever
   `sidelineswap.com` is registered), plus a webhook pointed at
   `https://<your-vercel-domain>/api/webhooks/resend` subscribed to the
   `email.delivered`, `email.opened`, `email.clicked`, `email.bounced`,
   and `email.complained` events. Gives you `RESEND_API_KEY` and
   `RESEND_WEBHOOK_SECRET`.
3. **Google OAuth credentials** — an OAuth client in Google Workspace
   admin, restricted to internal use, with the authorized redirect URI
   `https://<your-vercel-domain>/api/auth/callback/google` (and
   `http://localhost:3000/api/auth/callback/google` for local dev). Gives
   you `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.

Once you have those, set all the variables in `.env.example` as real
values in Vercel's Project Settings → Environment Variables (and in a
local `.env.local` for development). Never commit real values.

## Running locally

```bash
npm install
cp .env.example .env.local   # then fill in real values
npm run dev
```

Visit `http://localhost:3000` — you'll be sent to `/signin` until you sign
in with a `@sidelineswap.com` Google account.

## CSV format for contact uploads

Plain CSV with a header row:

```
first_name,email,payout_amount,city,state
Alex,alex@example.com,487,Woodbridge,NJ
```

- `email` is required; rows without a valid-looking email are skipped.
- Emails are lowercased/trimmed and deduplicated automatically — the
  last row wins if the same email appears twice, and re-uploading a file
  updates existing contacts (matched by email) instead of duplicating
  them.
- `payout_amount` accepts `487`, `$487`, or `487.00` — it's stored as
  integer cents and shown as a whole dollar amount everywhere in the UI.

## The email template

`src/lib/email/template.ts` renders the one Phase 1 template (the
MonkeySports/trade-in invite) to HTML + plain text for a given contact and
campaign. **This was built to the brand spec described in the project
brief, not from the actual mockup file** —
`sidelineswap-monkeysports-woodbridge-invite.html` hasn't been added to
this repo yet. Once it is, swap the markup in that file for the mockup's
real HTML; the merge-field contract (`ContactFields` / `CampaignFields` in
that same file) can stay the same.

One more approximation worth flagging: the product UI's default border
color (`pastel-green-500`, used by the bare `border` class everywhere) is
a guess (`#D7E4DE`) since the brief didn't give an exact hex — check it
against SidelineSwap's real design-system tokens if this project ever
needs to match pixel-for-pixel.

## How a send works

1. Upload a CSV on **Contacts**.
2. **New campaign** → fill in the event details (venue, dates, bonus
   code) and check off recipients (filterable by city/state).
3. On the campaign page: **Live preview** lets you see the exact
   rendered email for any of the first 25 recipients. **Send test to
   myself** sends the real template to your own inbox only — always do
   this before a real send.
4. **Send campaign** asks for confirmation, then sends one email per
   selected recipient via Resend, skipping anyone already on the
   suppression list (unsubscribed / bounced / complained).
5. Resend's webhook reports back delivered/opened/clicked/bounced/
   complained events, which show up as the campaign's metrics on the
   dashboard and its detail page.

Every email includes a one-click unsubscribe link (`/api/unsubscribe`)
that adds the address to the `suppressions` table immediately — from then
on, every future send checks that table first and skips suppressed
addresses automatically. A hard bounce or spam complaint reported by
Resend's webhook does the same thing automatically, no manual step
needed.

## Notes on scale

Sending loops over recipients one at a time in a single request
(`sendCampaign` in `src/app/campaigns/actions.ts`). That's fine for a
per-event campaign at Phase 1 volumes; if a campaign ever needs to reach
tens of thousands of recipients, that loop should move to a background
job/queue instead of running inline in a server action.
