# Trade-In Event RSVP Tool

Internal tool for SidelineSwap Marketing & Event Ops. Customers sign up for
event reminders and pre-register for trade-in events through public forms,
one set per region; coordinators manage their region's forms and see the
resulting signups here. Emailing past trade-in customers (the old
"Campaigns" feature) has been removed — that's handled by a separate tool
now.

## Stack

Next.js (App Router) · NextAuth (Google SSO) · Tailwind CSS · deployed on
Vercel. No database yet — see "Data storage" below.

## Data storage — read this before deploying

There is currently **no database wired up on purpose** (Supabase was pulled
out while that account isn't ready yet). Regions, reminder signups, and
pre-registrations all live in a plain in-memory store
(`src/lib/db/store.ts`) — no external account or setup needed to run the
app at all.

This is genuinely fine for running it locally with `npm run dev`: the data
sticks around for as long as that one process keeps running. **It will
not behave the same once deployed to Vercel.** Vercel runs routes as
separate, frequently-recycled serverless functions that don't share
memory with each other — so a signup submitted through the public form can
simply be invisible on the very next page load, or vanish entirely. Treat
a Vercel deployment right now as good for checking that pages render and
the design looks right, not as a durable place to collect real customer
signups.

Before this is used for anything real, it needs a real database behind
it — `src/lib/db/store.ts` is the one file every page/action talks to, so
swapping it for real queries shouldn't require touching the pages
themselves.

## What's here vs. what needs setup

One third-party account has to exist before sign-in works. Nothing in
this repo can create it for you — **this is Brendan's part**:

- **Google OAuth credentials** — an OAuth client in Google Workspace
  admin, restricted to internal use, with the authorized redirect URI
  `https://<your-vercel-domain>/api/auth/callback/google` (and
  `http://localhost:3000/api/auth/callback/google` for local dev). Gives
  you `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.

Once you have those, set all the variables in `.env.example` as real
values in Vercel's Project Settings → Environment Variables (and in a
local `.env.local` for development). Never commit real values. Without
these, the app still builds and the sign-in page still loads, but signing
in won't work.

## Running locally

```bash
npm install
cp .env.example .env.local   # then fill in real values
npm run dev
```

Visit `http://localhost:3000` — you'll be sent to `/signin` until you sign
in with a `@sidelineswap.com` Google account.

## How it works

- **Reminder signup form** (`/signup/[region]`) — public form where a
  customer asks to be reminded when SidelineSwap is running a trade-in
  event near them.
- **Pre-registration form** (`/preregister/[region]`) — public form for a
  customer to register ahead of a specific event, so they can skip the
  line and drop off gear directly.
- **Reminder signups** (sidebar) — the internal dashboard, one per region,
  showing that region's signups and pre-registrations as data tables.
- **Form links** (sidebar) — every region's public form links in one
  place, with an **Edit questions** link per form so a coordinator can
  reword any built-in question or add their own custom free-text
  questions for their region.
- **Events** (sidebar) — a region's event calendar. The intended workflow
  is a weekly CSV upload (see `src/lib/events-csv.ts` for the expected/
  aliased columns): uploading syncs the whole calendar to match the file,
  matching existing events to rows by venue + date, so no one re-enters
  events by hand. The per-event **Edit** page is there for one-off
  corrections between uploads, not routine data entry.
- **Settings** (sidebar) — a region's reminder-email content (subject,
  headline, intro, button, closing) and send timing. The email's visual
  design is fixed; only the content is per-region.

Everything under `/signup` and `/preregister` is public (no sign-in
required); everything else requires a signed-in `@sidelineswap.com` Google
account.

## Not built yet (known gaps)

- A real database — see "Data storage" above.
- Automated timed reminder emails (matching a signup to an upcoming event
  in their area and emailing them 1–2 weeks out).
- Tying a pre-registration to a real scheduled event once an event
  schedule exists, instead of the generic placeholder shown today.
- Per-coordinator logins scoped to just their own region.
