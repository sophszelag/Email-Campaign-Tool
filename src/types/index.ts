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
// a real scheduled event yet — once an event schedule exists, this should
// gain an event reference so the form (and this record) reflect the real
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
