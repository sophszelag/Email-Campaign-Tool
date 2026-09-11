import { randomUUID } from "node:crypto";
import type {
  Campaign,
  CampaignEvent,
  CampaignRecipient,
  Contact,
  Suppression,
  SuppressionReason,
} from "@/types";

/**
 * Temporary in-process replacement for a real database (Supabase is not
 * wired up yet). Stashed on globalThis so it survives Next.js dev's
 * module hot-reloading — without that, every edit-triggered reload would
 * silently wipe your contacts/campaigns while running `npm run dev`.
 *
 * IMPORTANT — this only behaves like a database on a single long-running
 * Node process (i.e. `npm run dev` or `npm start` locally). It will NOT
 * work correctly once deployed to Vercel: Vercel runs routes as separate
 * serverless functions/instances that don't share memory, and instances
 * are recycled constantly, so data written on one request (e.g. a CSV
 * upload) can vanish or be invisible to the very next request. Treat this
 * as a local-only stand-in for development, not something to point real
 * users at. Swap in a real database before deploying for real use.
 */
type Store = {
  contacts: Contact[];
  campaigns: Campaign[];
  campaignRecipients: CampaignRecipient[];
  campaignEvents: CampaignEvent[];
  suppressions: Suppression[];
};

const globalForStore = globalThis as unknown as { __campaignToolStore?: Store };

export const store: Store =
  globalForStore.__campaignToolStore ??
  (globalForStore.__campaignToolStore = {
    contacts: [],
    campaigns: [],
    campaignRecipients: [],
    campaignEvents: [],
    suppressions: [],
  });

export function newId(): string {
  return randomUUID();
}

export function upsertSuppression(email: string, reason: SuppressionReason): void {
  const existing = store.suppressions.find((s) => s.email === email);
  if (existing) {
    existing.reason = reason;
  } else {
    store.suppressions.push({ email, reason, suppressed_at: new Date().toISOString() });
  }
}
