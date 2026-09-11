export type Contact = {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  city: string | null;
  state: string | null;
  past_payout_amount_cents: number | null;
  source: "csv" | "qr" | "signup";
  created_at: string;
};

export type CampaignStatus = "draft" | "sending" | "sent";

export type Campaign = {
  id: string;
  name: string;
  template_id: string;
  event_venue: string;
  event_city: string;
  event_state: string | null;
  event_dates: string;
  event_hours: string | null;
  bonus_code: string;
  status: CampaignStatus;
  sent_at: string | null;
  created_by: string | null;
  created_at: string;
};

export type RecipientStatus =
  | "queued"
  | "sent"
  | "delivered"
  | "bounced"
  | "complained"
  | "unsubscribed"
  | "failed";

export type CampaignRecipient = {
  id: string;
  campaign_id: string;
  contact_id: string;
  personalized_preview: string | null;
  status: RecipientStatus;
  resend_email_id: string | null;
  sent_at: string | null;
  created_at: string;
};

export type CampaignEventType = "delivered" | "open" | "click" | "bounce" | "complaint";

export type CampaignEvent = {
  id: string;
  recipient_id: string;
  event_type: CampaignEventType;
  url: string | null;
  occurred_at: string;
};

export type SuppressionReason = "unsubscribed" | "bounced" | "complained";

export type Suppression = {
  email: string;
  reason: SuppressionReason;
  suppressed_at: string;
};

export type CampaignMetrics = {
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  unsubscribed: number;
};
