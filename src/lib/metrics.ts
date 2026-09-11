import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { CampaignMetrics } from "@/types";

/**
 * Basic per-campaign performance numbers for the dashboard. Runs a
 * handful of small counts per campaign — fine at Phase 1 volume (a
 * handful of campaigns, thousands of recipients each). Revisit with a
 * single aggregate query/materialized view if campaign volume grows.
 */
export async function getCampaignMetrics(campaignId: string): Promise<CampaignMetrics> {
  const supabase = getSupabaseServerClient();

  const [sent, bounced, unsubscribed, opened, clicked, delivered] = await Promise.all([
    supabase
      .from("campaign_recipients")
      .select("*", { count: "exact", head: true })
      .eq("campaign_id", campaignId)
      .not("resend_email_id", "is", null),
    supabase
      .from("campaign_recipients")
      .select("*", { count: "exact", head: true })
      .eq("campaign_id", campaignId)
      .eq("status", "bounced"),
    supabase
      .from("campaign_recipients")
      .select("*", { count: "exact", head: true })
      .eq("campaign_id", campaignId)
      .eq("status", "unsubscribed"),
    countDistinctRecipientsWithEvent(campaignId, "open"),
    countDistinctRecipientsWithEvent(campaignId, "click"),
    supabase
      .from("campaign_recipients")
      .select("*", { count: "exact", head: true })
      .eq("campaign_id", campaignId)
      .eq("status", "delivered"),
  ]);

  return {
    sent: sent.count ?? 0,
    delivered: delivered.count ?? 0,
    opened,
    clicked,
    bounced: bounced.count ?? 0,
    unsubscribed: unsubscribed.count ?? 0,
  };
}

async function countDistinctRecipientsWithEvent(
  campaignId: string,
  eventType: "open" | "click"
): Promise<number> {
  const supabase = getSupabaseServerClient();

  // campaign_events doesn't carry campaign_id directly, so join through
  // campaign_recipients. Supabase's PostgREST filter syntax lets us filter
  // on the joined table.
  const { data, error } = await supabase
    .from("campaign_events")
    .select("recipient_id, campaign_recipients!inner(campaign_id)")
    .eq("event_type", eventType)
    .eq("campaign_recipients.campaign_id", campaignId);

  if (error || !data) return 0;
  return new Set(data.map((row) => row.recipient_id)).size;
}
