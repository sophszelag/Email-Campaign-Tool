import Link from "next/link";
import { requireSession } from "@/lib/session";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getCampaignMetrics } from "@/lib/metrics";
import AppShell from "@/components/AppShell";
import type { Campaign } from "@/types";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await requireSession();

  const supabase = getSupabaseServerClient();
  const { data: campaigns, error } = await supabase
    .from("campaigns")
    .select("*")
    .order("created_at", { ascending: false });

  const campaignsWithMetrics = await Promise.all(
    (campaigns ?? []).map(async (campaign: Campaign) => ({
      campaign,
      metrics: await getCampaignMetrics(campaign.id),
    }))
  );

  return (
    <AppShell userEmail={session.user!.email!}>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-turf-green-500">Campaigns</h1>
        <Link
          href="/campaigns/new"
          className="rounded-md bg-turf-green-500 px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          New campaign
        </Link>
      </div>

      {error && <p className="mt-6 text-sm text-red-500">Couldn&apos;t load campaigns: {error.message}</p>}

      <div className="mt-6 overflow-x-auto rounded-lg border bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b text-slate-green-500">
              <th className="px-4 py-2 font-medium">Campaign</th>
              <th className="px-4 py-2 font-medium">Status</th>
              <th className="px-4 py-2 font-medium">Sent</th>
              <th className="px-4 py-2 font-medium">Delivered</th>
              <th className="px-4 py-2 font-medium">Opened</th>
              <th className="px-4 py-2 font-medium">Clicked</th>
              <th className="px-4 py-2 font-medium">Bounced</th>
              <th className="px-4 py-2 font-medium">Unsubscribed</th>
            </tr>
          </thead>
          <tbody>
            {campaignsWithMetrics.map(({ campaign, metrics }) => (
              <tr key={campaign.id} className="border-b last:border-0">
                <td className="px-4 py-2">
                  <Link href={`/campaigns/${campaign.id}`} className="font-medium text-turf-green-500 hover:underline">
                    {campaign.name}
                  </Link>
                  <div className="text-xs text-slate-green-500">
                    {campaign.event_venue} · {campaign.event_city}
                  </div>
                </td>
                <td className="px-4 py-2 capitalize">{campaign.status}</td>
                <td className="px-4 py-2">{metrics.sent}</td>
                <td className="px-4 py-2">{metrics.delivered}</td>
                <td className="px-4 py-2">{metrics.opened}</td>
                <td className="px-4 py-2">{metrics.clicked}</td>
                <td className="px-4 py-2">{metrics.bounced}</td>
                <td className="px-4 py-2">{metrics.unsubscribed}</td>
              </tr>
            ))}
            {campaignsWithMetrics.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-slate-green-500">
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
