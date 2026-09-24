import { renderConfirmationEmail, type ConfirmationEmailContent } from "./templates/confirmation";
import { SAMPLE_MERGE_DATA, type ReminderEmailMergeData } from "./templates/shared";

export type { ConfirmationEmailContent, ReminderEmailMergeData };
export { SAMPLE_MERGE_DATA };

/**
 * Renders the pre-registration confirmation email's full HTML for
 * preview. Unlike the reminder email, this has one fixed design (a
 * green "confirmed" badge instead of a dark hero) — deliberately
 * distinct at a glance, since the two emails serve different moments
 * in the customer's flow (asked to be reminded vs. just registered).
 */
export function renderConfirmationEmailHtml(
  content: ConfirmationEmailContent,
  data: ReminderEmailMergeData = SAMPLE_MERGE_DATA
): string {
  return renderConfirmationEmail(content, data);
}
