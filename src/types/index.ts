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

// A region's reminder-email settings: the editable content of the
// automated "we're headed your way" email, and how many days before an
// event it goes out. The email's visual design (colors, layout, logo,
// footer) is fixed — only these content fields are per-region. Merge
// fields (e.g. {{full_name}}) are plain text placeholders — nothing
// actually substitutes them yet outside of the settings-page preview
// (sample data), see reminder-email-defaults.ts for the full list and
// why real sending isn't wired up.
export type ReminderEmailSettings = {
  subject: string;
  headline: string;
  intro: string;
  button_label: string;
  closing: string;
  send_days_before_event: number;
  /** Reply-To header for the send (once wired up) — the coordinator's own inbox, so a customer's reply lands there directly rather than at the no-reply sending address. */
  reply_to_email: string;
};

// A region's pre-registration confirmation email: sent once someone
// pre-registers for an event. Event location/dates/hours come through
// merge fields (they vary per event) rather than being typed in here;
// the trade-in guidelines (what we accept/don't accept) are fixed content
// baked into the template itself, same for every region.
export type ConfirmationEmailSettings = {
  subject: string;
  headline: string;
  intro: string;
  closing: string;
};

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
  reminder_email: ReminderEmailSettings;
  confirmation_email: ConfirmationEmailSettings;
  created_at: string;
};

export type EventStatus = "upcoming" | "completed" | "cancelled";

// Which visual design a reminder email renders with — see
// src/lib/email/reminder-template.ts (EMAIL_TEMPLATES) for the actual
// layouts and their names/descriptions.
export type EmailTemplateId = "classic" | "minimal" | "bold";

// A coordinator's customized reminder email for one specific event: its
// own visual template, content, and send timing, overriding the region's
// generic reminder_email (Settings page) just for this event.
export type EventEmail = {
  template_id: EmailTemplateId;
  subject: string;
  headline: string;
  intro: string;
  button_label: string;
  closing: string;
  send_days_before_event: number;
};

// A scheduled trade-in event at a specific venue. Coordinators manage
// these directly (add/edit/cancel) rather than re-uploading a
// spreadsheet, since events change one at a time, not in bulk.
export type TradeInEvent = {
  id: string;
  region_id: string;
  /** Which of the region's subregion_options this event serves, for matching reminder signups to it. Null if it isn't tied to one specific area. */
  subregion: string | null;
  venue: string;
  city_state: string;
  /** ISO yyyy-mm-dd */
  start_date: string;
  /** ISO yyyy-mm-dd, for multi-day events. Null for a single-day event. */
  end_date: string | null;
  /** Free text, e.g. "10am–4pm". */
  hours: string | null;
  /** Optional registration cap, for showing a "X/Y registered" progress bar. Null if uncapped. */
  capacity: number | null;
  /** This event's own reminder email, if a coordinator has set one up. Null falls back to the region's generic reminder_email. */
  email: EventEmail | null;
  status: EventStatus;
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

// A customer registering ahead of a specific trade-in event.
export type PreRegistration = {
  id: string;
  region_id: string;
  /** The event shown on the form at the time they registered. Null if the region had no upcoming event scheduled yet. */
  event_id: string | null;
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
