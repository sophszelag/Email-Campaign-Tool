import type { EmailTemplateId } from "@/types";
import { renderClassicEmail } from "./templates/classic";
import { renderMinimalEmail } from "./templates/minimal";
import { renderBoldEmail } from "./templates/bold";
import type { EmailContent, ReminderEmailMergeData } from "./templates/shared";
import { SAMPLE_MERGE_DATA } from "./templates/shared";

export type { ReminderEmailMergeData, EmailContent };
export { SAMPLE_MERGE_DATA };

export const EMAIL_TEMPLATES: { id: EmailTemplateId; name: string; description: string }[] = [
  { id: "classic", name: "Classic", description: "Dark hero section, event-details card, centered button." },
  { id: "minimal", name: "Minimal", description: "Plain white background, left-aligned, understated — reads like a heads-up, not a promo." },
  { id: "bold", name: "Bold", description: "Full-color hero, high contrast, a CTA button near the top and bottom." },
];

/**
 * Renders a reminder email's full HTML for preview, using whichever
 * visual template is selected. All three templates take the same
 * `EmailContent` shape, so switching templates never loses a
 * coordinator's copy — only the layout/colors change.
 *
 * These use <style> + classes rather than inlined CSS: fine for Gmail/
 * Apple Mail, but Outlook desktop strips <style> blocks. Worth running
 * through an inliner (e.g. MJML, Juice) before this is wired up to a
 * real send.
 *
 * Known gap: no unsubscribe link in any template. The suppression-list
 * mechanism was removed along with the old email-sending feature, so
 * before this ever sends to real customers it needs one reintroduced.
 */
export function renderReminderEmailHtml(
  templateId: EmailTemplateId,
  content: EmailContent,
  data: ReminderEmailMergeData = SAMPLE_MERGE_DATA
): string {
  switch (templateId) {
    case "minimal":
      return renderMinimalEmail(content, data);
    case "bold":
      return renderBoldEmail(content, data);
    case "classic":
    default:
      return renderClassicEmail(content, data);
  }
}
