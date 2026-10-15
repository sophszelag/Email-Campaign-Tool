import type { SignupConfirmationEmailSettings } from "@/types";

// Merge fields available in the reminder signup confirmation email —
// drawn from the reminder signup form itself, not an event (no event is
// scheduled yet at this point in the flow).
export const SIGNUP_CONFIRMATION_MERGE_FIELDS: { field: string; description: string }[] = [
  { field: "{{full_name}}", description: "The signup's name" },
  { field: "{{home_city_state}}", description: "Where they said they're located" },
  { field: "{{travel_radius}}", description: "How far they'll travel for an event" },
  { field: "{{desired_areas}}", description: "The area(s) they want reminders for" },
  { field: "{{traded_before}}", description: "Whether they've traded in with us before (Yes/No)" },
];

export function defaultSignupConfirmationEmailSettings(): SignupConfirmationEmailSettings {
  return {
    subject: "You're signed up for trade-in event reminders!",
    headline: "You're all set!",
    intro:
      "Thanks for signing up — here's a quick summary of what you told us. We'll email you as soon as we schedule an event near you.",
    closing: "Talk soon!\nSidelineSwap Events",
  };
}
