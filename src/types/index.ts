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
  accepted_categories: string | null;
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

// A free-text question a region's coordinator bolted onto one of their
// public forms, in addition to the built-in fields.
export type CustomQuestion = {
  id: string;
  label: string;
  required: boolean;
};

// A region's edits to one of its public forms: reworded built-in
// question labels (falls back to the form's default wording when a key
// has no override) plus any extra questions appended at the end.
export type FormCustomization = {
  field_labels: Record<string, string>;
  custom_questions: CustomQuestion[];
};

export function emptyFormCustomization(): FormCustomization {
  return { field_labels: {}, custom_questions: [] };
}

// A geographic area SidelineSwap runs trade-in events in — each gets its
// own public signup form and (eventually) its own reminder cadence.
export type Region = {
  id: string;
  slug: string;
  name: string;
  /** The "Desired Regions for Reminders" checklist — specific to this region. */
  subregion_options: string[];
  signup_form: FormCustomization;
  preregister_form: FormCustomization;
  created_at: string;
};

export type TravelRadius = "25" | "50" | "100" | "any";

// One response to a region's public "remind me about events near me" form.
export type ReminderSignup = {
  id: string;
  region_id: string;
  full_name: string;
  /** The form allows adding more than one email address per signup. */
  emails: string[];
  traded_before: boolean;
  home_city_state: string;
  home_store: string;
  travel_radius: TravelRadius;
  desired_subregions: string[];
  desired_subregions_other: string | null;
  requested_locations: string | null;
  /** Answers to this region's custom questions, keyed by CustomQuestion.id. */
  custom_answers: Record<string, string>;
  created_at: string;
};

export type Sport =
  | "baseball"
  | "basketball"
  | "football"
  | "hockey"
  | "lacrosse"
  | "soccer"
  | "softball"
  | "tennis"
  | "other";

export type ItemCount = "1-3" | "4-7" | "8-12" | "13+";

// A customer registering ahead of a specific trade-in event. Not tied to
// a real Campaign/event yet — once an event schedule exists, this should
// gain a campaign_id so the form (and this record) reflect the real
// event instead of the generic placeholder.
export type PreRegistration = {
  id: string;
  region_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  /** Customers often bring gear from more than one sport, so this is multi-select. */
  sports: Sport[];
  item_count: ItemCount;
  has_referral_code: boolean;
  referral_code: string | null;
  /** Answers to this region's custom questions, keyed by CustomQuestion.id. */
  custom_answers: Record<string, string>;
  created_at: string;
};
