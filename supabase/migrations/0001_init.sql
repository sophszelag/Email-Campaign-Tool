-- Event Campaign Tool — Phase 1 schema
--
-- NOT CURRENTLY WIRED UP. The app runs on an in-memory store
-- (src/lib/db/store.ts) for now — no database is required to run it.
-- This file is kept as the intended schema for whenever real persistence
-- (Supabase or otherwise) gets added back; at that point, run it against
-- your Postgres instance (Supabase's SQL Editor, `supabase db push`, etc.)
-- and reconnect the app's data-access layer to it.

create extension if not exists "pgcrypto";

-- Past customers, imported via CSV. Also the eventual home for QR/signup
-- sourced contacts in later phases.
create table if not exists contacts (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  first_name text,
  last_name text,
  city text,
  state text,
  past_payout_amount_cents integer,
  source text not null default 'csv' check (source in ('csv', 'qr', 'signup')),
  created_at timestamptz not null default now()
);

create index if not exists contacts_city_state_idx on contacts (state, city);

-- One row per campaign (one event = one campaign, in Phase 1).
create table if not exists campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  template_id text not null default 'monkeysports_invite',
  event_venue text not null,
  event_city text not null,
  event_state text,
  event_dates text not null,
  event_hours text,
  -- Free-text description of what's accepted (e.g. "Hockey, lacrosse,
  -- baseball, softball") — shown in the invite email's "Bringing" row when
  -- set. Optional since it varies per venue and isn't in every event.
  accepted_categories text,
  bonus_code text not null,
  status text not null default 'draft' check (status in ('draft', 'sending', 'sent')),
  sent_at timestamptz,
  created_by text,
  created_at timestamptz not null default now()
);

-- One row per (campaign, contact): the actual personalized send.
create table if not exists campaign_recipients (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaigns (id) on delete cascade,
  contact_id uuid not null references contacts (id) on delete cascade,
  personalized_preview text,
  status text not null default 'queued' check (
    status in ('queued', 'sent', 'delivered', 'bounced', 'complained', 'unsubscribed', 'failed')
  ),
  resend_email_id text,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  unique (campaign_id, contact_id)
);

create index if not exists campaign_recipients_campaign_idx on campaign_recipients (campaign_id);
create index if not exists campaign_recipients_resend_email_id_idx on campaign_recipients (resend_email_id);

-- Open/click/bounce/complaint events from Resend's webhook, one row each.
create table if not exists campaign_events (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references campaign_recipients (id) on delete cascade,
  event_type text not null check (event_type in ('delivered', 'open', 'click', 'bounce', 'complaint')),
  url text,
  occurred_at timestamptz not null default now()
);

create index if not exists campaign_events_recipient_idx on campaign_events (recipient_id);

-- Permanent suppression list. Anyone in here is excluded from every future
-- send, full stop — this is the CAN-SPAM backbone.
create table if not exists suppressions (
  email text primary key,
  reason text not null check (reason in ('unsubscribed', 'bounced', 'complained')),
  suppressed_at timestamptz not null default now()
);
