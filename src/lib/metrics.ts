import { store } from "@/lib/db/store";
import type { CampaignMetrics } from "@/types";

/** Basic per-campaign performance numbers for the dashboard. */
export function getCampaignMetrics(campaignId: string): CampaignMetrics {
  const recipients = store.campaignRecipients.filter((r) => r.campaign_id === campaignId);
  const recipientIds = new Set(recipients.map((r) => r.id));
  const events = store.campaignEvents.filter((e) => recipientIds.has(e.recipient_id));

  const opened = new Set(events.filter((e) => e.event_type === "open").map((e) => e.recipient_id)).size;
  const clicked = new Set(events.filter((e) => e.event_type === "click").map((e) => e.recipient_id)).size;

  return {
    sent: recipients.filter((r) => r.resend_email_id).length,
    delivered: recipients.filter((r) => r.status === "delivered").length,
    opened,
    clicked,
    bounced: recipients.filter((r) => r.status === "bounced").length,
    unsubscribed: recipients.filter((r) => r.status === "unsubscribed").length,
  };
}
