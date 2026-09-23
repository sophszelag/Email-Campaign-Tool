import type { ReminderEmailSettings } from "@/types";

// Merge fields a coordinator can drop into the subject/body. Nothing
// actually substitutes these yet — sending isn't wired up (needs a real
// event schedule, a real database, and Resend/domain setup), so this is
// documentation for what WILL be available once it is, shown next to the
// editor so a coordinator can write the real email now.
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
    body: `Hi {{full_name}},

We'll be hosting a trade-in event near you on {{event_date}} at {{event_venue}}.

Pre-register now to skip the line — just drop off your gear when you arrive:
{{preregister_link}}

See you there!
SidelineSwap Events`,
    send_days_before_event: 10,
  };
}
