import { notFound } from "next/navigation";
import { requireSession } from "@/lib/session";
import { store } from "@/lib/db/store";
import { getCampaignMetrics } from "@/lib/metrics";
import { renderInviteEmail } from "@/lib/email/template";
import AppShell from "@/components/AppShell";
import StatusBadge from "@/components/StatusBadge";
import PreviewPane, { type PreviewOption } from "@/app/campaigns/[id]/PreviewPane";
import SendTestButton from "@/app/campaigns/[id]/SendTestButton";
import SendCampaignButton from "@/app/campaigns/[id]/SendCampaignButton";

export const dynamic = "force-dynamic";

const PREVIEW_SAMPLE_SIZE = 25;

export default async function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireSession();
  const { id } = await params;

  const campaign = store.campaigns.find((c) => c.id === id);
  if (!campaign) notFound();

  const allRecipients = store.campaignRecipients.filter((r) => r.campaign_id === id);
  const recipientCount = allRecipients.filter((r) => r.status === "queued").length;
  const metrics = getCampaignMetrics(id);

  const previewOptions: PreviewOption[] = allRecipients.slice(0, PREVIEW_SAMPLE_SIZE).flatMap((r) => {
    const contact = store.contacts.find((c) => c.id === r.contact_id);
    if (!contact) return [];
    const rendered = renderInviteEmail(contact, {
      event_venue: campaign.event_venue,
      event_city: campaign.event_city,
      event_state: campaign.event_state,
      event_dates: campaign.event_dates,
      event_hours: campaign.event_hours,
      accepted_categories: campaign.accepted_categories,
      bonus_code: campaign.bonus_code,
    });
    return [
      {
        id: r.id,
        label: `${contact.first_name ?? contact.email} <${contact.email}>`,
        html: rendered.html,
      },
    ];
  });

  return (
    <AppShell
      userEmail={session.user!.email!}
      title={campaign.name}
      subtitle={`${campaign.event_venue} · ${campaign.event_city}${
        campaign.event_state ? `, ${campaign.event_state}` : ""
      } · ${campaign.event_dates}`}
      actions={<StatusBadge status={campaign.status} />}
    >
      <section className="grid grid-cols-2 gap-4 sm:grid-cols-6">
        <Metric label="Sent" value={metrics.sent} />
        <Metric label="Delivered" value={metrics.delivered} />
        <Metric label="Opened" value={metrics.opened} />
        <Metric label="Clicked" value={metrics.clicked} />
        <Metric label="Bounced" value={metrics.bounced} />
        <Metric label="Unsubscribed" value={metrics.unsubscribed} />
      </section>

      <section className="mt-8 overflow-hidden rounded-[10px] border bg-white shadow-sm">
        <div className="border-b p-4">
          <h2 className="text-sm font-bold text-turf-green-500">Live preview</h2>
        </div>
        <PreviewPane options={previewOptions} />
      </section>

      <section className="mt-8 flex flex-col gap-4 rounded-[10px] border bg-white p-6 shadow-sm">
        <h2 className="text-sm font-bold text-turf-green-500">Send</h2>
        <SendTestButton campaignId={campaign.id} />
        {campaign.status === "sent" ? (
          <p className="text-sm text-slate-green-500">This campaign has already been sent.</p>
        ) : (
          <SendCampaignButton campaignId={campaign.id} recipientCount={recipientCount} />
        )}
      </section>
    </AppShell>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border bg-white p-4 text-center shadow-sm">
      <div className="text-2xl font-black text-turf-green-500">{value}</div>
      <div className="text-xs text-slate-green-500">{label}</div>
    </div>
  );
}
