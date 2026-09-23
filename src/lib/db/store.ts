import { randomUUID } from "node:crypto";
import type {
  Campaign,
  CampaignEvent,
  CampaignRecipient,
  Contact,
  PreRegistration,
  Region,
  ReminderSignup,
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
  regions: Region[];
  reminderSignups: ReminderSignup[];
  preRegistrations: PreRegistration[];
};

// South NJ / Philadelphia is the first region, seeded to match Soph's real
// Google Form exactly. More regions get added here as they come online.
const SEED_REGIONS: Region[] = [
  {
    id: "south-nj-philadelphia",
    slug: "south-nj-philadelphia",
    name: "South NJ / Philadelphia",
    subregion_options: [
      "Mercer County NJ (Dick's Princeton)",
      "Burlington County NJ (Dicks Deptford, Dicks Cherry Hill, Dicks Mt. Laurel)",
      "Delaware (House of Sport Brandywine, Dicks Christiana)",
      "Bucks County PA (Dick's Oxford Valley)",
      "Montgomery County (Dicks Montgomeryville, Dicks Willow Grove, Dicks Plymouth Meeting)",
      "Lehigh Valley Area (Dick's Easton)",
      "MonkeySports Woodbridge NJ",
      "MonkeySports Lodi NJ",
      "NJ Shore Area (Dicks Brick, Dicks Manahawkin)",
    ],
    created_at: new Date().toISOString(),
  },
];

const globalForStore = globalThis as unknown as { __campaignToolStore?: Store };

export const store: Store =
  globalForStore.__campaignToolStore ??
  (globalForStore.__campaignToolStore = {
    contacts: [],
    campaigns: [],
    campaignRecipients: [],
    campaignEvents: [],
    suppressions: [],
    regions: [...SEED_REGIONS],
    reminderSignups: [],
    preRegistrations: [],
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
