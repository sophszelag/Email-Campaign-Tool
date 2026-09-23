import type { ReminderEmailSettings } from "@/types";

// Merge fields a coordinator can drop into headline/intro/closing text.
// Nothing actually substitutes these with real data yet — sending isn't
// wired up (needs a real event schedule, a real database, and Resend/
// domain setup) — but the live preview below substitutes sample values so
// a coordinator can see roughly how it'll read once it is.
export const REMINDER_EMAIL_MERGE_FIELDS: { field: string; description: string }[] = [
  { field: "{{full_name}}", description: "The signup's name" },
  { field: "{{event_name}}", description: "The event's name" },
  { field: "{{event_date}}", description: "The event's date" },
  { field: "{{event_venue}}", description: "The event's venue" },
  { field: "{{preregister_link}}", description: "Link to that event's pre-registration form" },
];

export function defaultReminderEmailSettings(): ReminderEmailSettings {
  return {
    subject: "We're heading to {{event_venue}} soon!",
    headline: "We'll be near you soon",
    intro:
      "Thanks for signing up for reminders — we wanted to give you a heads up before we're in your area.\n\nPre-register now to skip the line: just drop off your gear and go when you get to the event.",
    button_label: "Pre-Register Now",
    closing: "See you there!\nSidelineSwap Events",
    send_days_before_event: 10,
    reply_to_email: "",
  };
}
