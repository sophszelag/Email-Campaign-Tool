import { requireSession } from "@/lib/session";
import { getSupabaseServerClient } from "@/lib/supabase/server";
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

  const supabase = getSupabaseServerClient();

  const { data: suppressions } = await supabase.from("suppressions").select("email");
  const suppressedEmails = (suppressions ?? []).map((s) => s.email);

  let query = supabase
    .from("contacts")
    .select("*")
    .order("first_name", { ascending: true })
    .limit(RECIPIENT_LIMIT);

  if (city) query = query.ilike("city", `%${city}%`);
  if (state) query = query.ilike("state", `%${state}%`);
  if (suppressedEmails.length > 0) query = query.not("email", "in", `(${suppressedEmails.join(",")})`);

  const { data: contacts, count } = await query;

  return (
    <AppShell userEmail={session.user!.email!} title="New campaign">
      <CreateCampaignForm
        contacts={contacts ?? []}
        totalMatches={count}
        recipientLimit={RECIPIENT_LIMIT}
        city={city}
        state={state}
      />
    </AppShell>
  );
}
