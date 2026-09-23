import type { EventEmail, Region } from "@/types";

/** Seeds a new per-event email from the region's generic reminder-email content, so a coordinator edits from something rather than a blank form. */
export function defaultEventEmail(region: Region): EventEmail {
  return {
    template_id: "classic",
    subject: region.reminder_email.subject,
    headline: region.reminder_email.headline,
    intro: region.reminder_email.intro,
    button_label: region.reminder_email.button_label,
    closing: region.reminder_email.closing,
    send_days_before_event: region.reminder_email.send_days_before_event,
  };
}
