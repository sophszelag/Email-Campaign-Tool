import type { ConfirmationEmailSettings } from "@/types";

export function defaultConfirmationEmailSettings(): ConfirmationEmailSettings {
  return {
    subject: "You're pre-registered for {{event_venue}}!",
    headline: "You're all set!",
    intro:
      "Thanks for pre-registering — we've got your info on file. When you arrive, just check in and head straight to drop-off, no waiting in the general line.",
    closing: "See you there!\nSidelineSwap Events",
  };
}
