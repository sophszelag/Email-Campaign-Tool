import { notFound } from "next/navigation";
import { requireSession } from "@/lib/session";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getCampaignMetrics } from "@/lib/metrics";
import { renderInviteEmail } from "@/lib/email/template";
import AppShell from "@/components/AppShell";
import PreviewPane, { type PreviewOption } from "@/app/campaigns/[id]/PreviewPane";
import SendTestButton from "@/app/campaigns/[id]/SendTestButton";
import SendCampaignButton from "@/app/campaigns/[id]/SendCampaignButton";
import type { Contact } from "@/types";

export const dynamic = "force-dynamic";

const PREVIEW_SAMPLE_SIZE = 25;

export default async function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireSession();
  const { id } = await params;

  const supabase = getSupabaseServerClient();

  const { data: campaign } = await supabase.from("campaigns").select("*").eq("id", id).single();
  if (!campaign) notFound();

  const [{ data: recipients }, { count: recipientCount }, metrics] = await Promise.all([
    supabase.from("campaign_recipients").select("*, contacts(*)").eq("campaign_id", id).limit(PREVIEW_SAMPLE_SIZE),
    supabase
      .from("campaign_recipients")
      .select("*", { count: "exact", head: true })
      .eq("campaign_id", id)
      .eq("status", "queued"),
    getCampaignMetrics(id),
  ]);

  const previewOptions: PreviewOption[] = (recipients ?? []).map((r) => {
    const contact = r.contacts as unknown as Contact;
    const rendered = renderInviteEmail(contact, {
      event_venue: campaign.event_venue,
      event_city: campaign.event_city,
      event_dates: campaign.event_dates,
      event_hours: campaign.event_hours,
      bonus_code: campaign.bonus_code,
    });
    return {
      id: r.id,
      label: `${contact.first_name ?? contact.email} <${contact.email}>`,
      html: rendered.html,
    };
  });

  return (
    <AppShell userEmail={session.user!.email!}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-turf-green-500">{campaign.name}</h1>
          <p className="text-sm text-slate-green-500">
            {campaign.event_venue} · {campaign.event_city}
            {campaign.event_state ? `, ${campaign.event_state}` : ""} · {campaign.event_dates}
          </p>
        </div>
        <span className="rounded-full border px-3 py-1 text-xs font-medium capitalize text-turf-green-500">
          {campaign.status}
        </span>
      </div>

      <section className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-6">
        <Metric label="Sent" value={metrics.sent} />
        <Metric label="Delivered" value={metrics.delivered} />
        <Metric label="Opened" value={metrics.opened} />
        <Metric label="Clicked" value={metrics.clicked} />
        <Metric label="Bounced" value={metrics.bounced} />
        <Metric label="Unsubscribed" value={metrics.unsubscribed} />
      </section>

      <section className="mt-8 rounded-lg border bg-white">
        <div className="border-b p-4">
          <h2 className="text-sm font-semibold text-turf-green-500">Live preview</h2>
        </div>
        <PreviewPane options={previewOptions} />
      </section>

      <section className="mt-8 flex flex-col gap-4 rounded-lg border bg-white p-6">
        <h2 className="text-sm font-semibold text-turf-green-500">Send</h2>
        <SendTestButton campaignId={campaign.id} />
        {campaign.status === "sent" ? (
          <p className="text-sm text-slate-green-500">This campaign has already been sent.</p>
        ) : (
          <SendCampaignButton campaignId={campaign.id} recipientCount={recipientCount ?? 0} />
        )}
      </section>
    </AppShell>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border bg-white p-4 text-center">
      <div className="text-2xl font-bold text-turf-green-500">{value}</div>
      <div className="text-xs text-slate-green-500">{label}</div>
    </div>
  );
}
