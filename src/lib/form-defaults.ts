// Default question wording for the two public forms. A region's
// field_labels overrides these; components should always look up
// `region.signup_form.field_labels[key] ?? SIGNUP_FIELD_DEFAULTS[key]`
// (or use the getLabel helpers below) rather than hardcoding text, so a
// coordinator's edits actually take effect.

export const SIGNUP_FIELD_DEFAULTS: Record<string, string> = {
  full_name: "Full Name",
  emails: "Email Address (add multiple if desired)",
  traded_before: "Have you traded in with us before?",
  home_city_state: "What town and state do you live in?",
  home_store: 'What is your "home" Dick’s Store where you shop most?',
  travel_radius: "How far are you willing to travel for a trade-in event?",
  desired_subregions: "Desired Regions for Reminders",
  requested_locations: "Are there any locations not listed you would like us to host an event?",
};

export const PREREGISTER_FIELD_DEFAULTS: Record<string, string> = {
  first_name: "First name",
  last_name: "Last name",
  email: "Email",
  phone: "Phone",
  sport: "Sport",
  item_count: "Approximate number of items",
  has_referral_code: "Have a referral code?",
};

export function getFieldLabel(
  defaults: Record<string, string>,
  overrides: Record<string, string>,
  key: string
): string {
  return overrides[key]?.trim() || defaults[key];
}
