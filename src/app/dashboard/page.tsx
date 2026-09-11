import Link from "next/link";
import { requireSession } from "@/lib/session";
import { store } from "@/lib/db/store";
import { getCampaignMetrics } from "@/lib/metrics";
import AppShell from "@/components/AppShell";
import StatusBadge from "@/components/StatusBadge";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await requireSession();

  const campaigns = [...store.campaigns].sort((a, b) => b.created_at.localeCompare(a.created_at));
  const campaignsWithMetrics = campaigns.map((campaign) => ({
    campaign,
    metrics: getCampaignMetrics(campaign.id),
  }));

  const totals = campaignsWithMetrics.reduce(
    (acc, { metrics }) => ({
      sent: acc.sent + metrics.sent,
      delivered: acc.delivered + metrics.delivered,
      opened: acc.opened + metrics.opened,
    }),
    { sent: 0, delivered: 0, opened: 0 }
  );
  const avgOpenRate = totals.delivered > 0 ? (totals.opened / totals.delivered) * 100 : 0;

  return (
    <AppShell
      userEmail={session.user!.email!}
      title="Campaigns"
      subtitle="Event invite campaigns and how they've performed"
      actions={
        <Link
          href="/campaigns/new"
          className="rounded-md bg-turf-green-500 px-4 py-2 text-sm font-bold text-white hover:bg-[#18201D]"
        >
          New campaign
        </Link>
      }
    >
      <div className="mb-7 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Metric label="Contacts on file" value={store.contacts.length.toLocaleString()} />
        <Metric label="Campaigns" value={campaignsWithMetrics.length.toLocaleString()} />
        <Metric label="Total sent" value={totals.sent.toLocaleString()} />
        <Metric label="Avg. open rate" value={`${avgOpenRate.toFixed(1)}%`} />
      </div>

      <div className="overflow-hidden overflow-x-auto rounded-[10px] border bg-white shadow-sm">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="bg-offwhite">
              <Th>Campaign</Th>
              <Th align="right">Status</Th>
              <Th align="right">Sent</Th>
              <Th align="right">Delivered</Th>
              <Th align="right">Opened</Th>
              <Th align="right">Clicked</Th>
              <Th align="right">Bounced</Th>
              <Th align="right">Unsubs</Th>
            </tr>
          </thead>
          <tbody>
            {campaignsWithMetrics.map(({ campaign, metrics }) => (
              <tr key={campaign.id} className="border-b border-pastel-green-500 last:border-0">
                <td className="px-4 py-3.5">
                  <Link
                    href={`/campaigns/${campaign.id}`}
                    className="block font-bold text-turf-green-500 hover:underline"
                  >
                    {campaign.name}
                  </Link>
                  <span className="text-xs font-medium text-slate-green-500">
                    {campaign.event_venue} · {campaign.event_city}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-right">
                  <StatusBadge status={campaign.status} />
                </td>
                <td className="px-4 py-3.5 text-right font-bold text-turf-green-500">{metrics.sent}</td>
                <td className="px-4 py-3.5 text-right">{metrics.delivered}</td>
                <td className="px-4 py-3.5 text-right">
                  <Rate count={metrics.opened} of={metrics.delivered} />
                </td>
                <td className="px-4 py-3.5 text-right">
                  <Rate count={metrics.clicked} of={metrics.delivered} />
                </td>
                <td className="px-4 py-3.5 text-right text-slate-green-500">{metrics.bounced}</td>
                <td className="px-4 py-3.5 text-right text-slate-green-500">{metrics.unsubscribed}</td>
              </tr>
            ))}
            {campaignsWithMetrics.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-slate-green-500">
                  No campaigns yet — create one to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-slate-green-500">{label}</div>
      <div className="mt-2 text-[26px] font-black tracking-tight text-turf-green-500">{value}</div>
    </div>
  );
}

function Th({ children, align }: { children: React.ReactNode; align?: "right" }) {
  return (
    <th
      className={`px-4 py-3 text-[11px] font-bold uppercase tracking-[0.1em] text-slate-green-500 ${
        align === "right" ? "text-right" : "text-left"
      }`}
    >
      {children}
    </th>
  );
}

function Rate({ count, of }: { count: number; of: number }) {
  if (of === 0) return <span className="text-slate-green-500">—</span>;
  const pct = (count / of) * 100;
  return (
    <span className="font-bold text-green-500">
      {pct.toFixed(1)}% <span className="font-medium text-slate-green-500">({count})</span>
    </span>
  );
}
