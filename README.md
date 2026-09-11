# Event Campaign Tool

Internal tool for SidelineSwap Marketing & Event Ops: upload past trade-in
customers, create a campaign for an upcoming event, and send a personalized
invite email with a bonus code. Phase 1 scope — see the project brief for
what's intentionally left out (Metabase sync, event calendar integration,
multiple templates, reminder signups) for later phases.

## Stack

Next.js (App Router) · NextAuth (Google SSO) · Resend (transactional email)
· Tailwind CSS · deployed on Vercel. No database yet — see "Data storage"
below.

## Data storage — read this before deploying

There is currently **no database wired up on purpose** (Supabase was pulled
out while that account isn't ready yet). Contacts, campaigns, and sends
all live in a plain in-memory store (`src/lib/db/store.ts`) — no external
account or setup needed to run the app at all.

This is genuinely fine for running it locally with `npm run dev`: the data
sticks around for as long as that one process keeps running. **It will
not behave the same once deployed to Vercel.** Vercel runs routes as
separate, frequently-recycled serverless functions that don't share
memory with each other — so a CSV you upload, or a campaign you create,
can simply be invisible on the very next page load, or vanish entirely.
Treat a Vercel deployment right now as good for checking that pages
render and the design looks right, not as something to actually store
real data in or send a real campaign from.

Before this is used for anything real, it needs a real database back —
`supabase/migrations/0001_init.sql` still describes the intended schema
for whenever that happens (Supabase or otherwise), and `src/lib/db/store.ts`
is the one file every page/action talks to, so swapping it for real
queries shouldn't require touching the pages themselves.

## What's here vs. what needs setup

Once the database question above is settled, two more third-party
accounts have to exist before sending real email actually works. Nothing
in this repo can create those accounts for you — **this is Brendan's
part**:

1. **Resend account** — with `mail.sidelineswap.com` added and verified as
   a sending domain (SPF/DKIM/DMARC records added wherever
   `sidelineswap.com` is registered), plus a webhook pointed at
   `https://<your-vercel-domain>/api/webhooks/resend` subscribed to the
   `email.delivered`, `email.opened`, `email.clicked`, `email.bounced`,
   and `email.complained` events. Gives you `RESEND_API_KEY` and
   `RESEND_WEBHOOK_SECRET`.
2. **Google OAuth credentials** — an OAuth client in Google Workspace
   admin, restricted to internal use, with the authorized redirect URI
   `https://<your-vercel-domain>/api/auth/callback/google` (and
   `http://localhost:3000/api/auth/callback/google` for local dev). Gives
   you `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.

Once you have those, set all the variables in `.env.example` as real
values in Vercel's Project Settings → Environment Variables (and in a
local `.env.local` for development). Never commit real values. Without
these, the app still builds and the sign-in page still loads, but signing
in and sending won't work.

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
MonkeySports/Woodbridge trade-in invite) to HTML + plain text for a given
contact and campaign. The markup/CSS/copy is taken directly from
`sidelineswap-monkeysports-woodbridge-invite.html`, with the
Woodbridge-specific details swapped for merge fields. A few gaps vs. that
mockup are called out in comments at the top of that file — most notably,
the CTA buttons still point at `#` (no RSVP/event-finder page exists yet
to send them to), and the footer drops "Update preferences"/"View in
browser" since neither exists yet.

The product UI's colors in `src/app/globals.css` are the real hex values
from `sidelineswap-event-campaign-tool-mockup.html`'s design tokens.

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
that adds the address to the suppression list immediately — from then on,
every future send checks that list first and skips suppressed addresses
automatically. A hard bounce or spam complaint reported by Resend's
webhook does the same thing automatically, no manual step needed. (Same
caveat as above: right now that list only lives as long as the process
does.)

## Notes on scale

Sending loops over recipients one at a time in a single request
(`sendCampaign` in `src/app/campaigns/actions.ts`). That's fine for a
per-event campaign at Phase 1 volumes; if a campaign ever needs to reach
tens of thousands of recipients, that loop should move to a background
job/queue instead of running inline in a server action.
