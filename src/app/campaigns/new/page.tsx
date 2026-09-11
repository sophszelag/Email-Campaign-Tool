import { requireSession } from "@/lib/session";
import { store } from "@/lib/db/store";
import AppShell from "@/components/AppShell";
import CreateCampaignForm from "@/app/campaigns/new/CreateCampaignForm";

export const dynamic = "force-dynamic";

const RECIPIENT_LIMIT = 500;

export default async function NewCampaignPage({
  searchParams,
}: {
  searchParams: Promise<{ city?: string; state?: string }>;
}) {
  const session = await requireSession();
  const { city, state } = await searchParams;

  const suppressedEmails = new Set(store.suppressions.map((s) => s.email));

  let contacts = store.contacts.filter((c) => !suppressedEmails.has(c.email));
  if (city) contacts = contacts.filter((c) => c.city?.toLowerCase().includes(city.toLowerCase()));
  if (state) contacts = contacts.filter((c) => c.state?.toLowerCase().includes(state.toLowerCase()));
  contacts = [...contacts].sort((a, b) => (a.first_name ?? "").localeCompare(b.first_name ?? ""));

  const count = contacts.length;
  contacts = contacts.slice(0, RECIPIENT_LIMIT);

  return (
    <AppShell userEmail={session.user!.email!} title="New campaign">
      <CreateCampaignForm
        contacts={contacts}
        totalMatches={count}
        recipientLimit={RECIPIENT_LIMIT}
        city={city}
        state={state}
      />
    </AppShell>
  );
}
