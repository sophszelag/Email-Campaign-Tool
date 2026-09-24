import {
  escapeHtml,
  renderMergeText,
  renderParagraphs,
  HEADER_LOGO_SVG_WHITE,
  MAILING_ADDRESS,
  type ReminderEmailMergeData,
} from "./shared";

export type ConfirmationEmailContent = {
  subject: string;
  headline: string;
  intro: string;
  closing: string;
};

const WE_ACCEPT = [
  "Item is in good working condition",
  "Purchased within the past 5 years",
  "Original retail value of more than $100",
  "Most sports and outdoor categories, including hockey, baseball, softball, golf, lacrosse, snow sports, racquet sports, camping & hiking, fishing, fitness, premium outerwear, and coolers",
];

const WE_DONT_ACCEPT = [
  "Damaged or heavily worn products (no repairs)",
  "Items that aren't easy to clean (mold or mildew)",
  "Items purchased more than 5 years ago",
  "Knock-offs, generic store brands, and counterfeits",
  "Large items like bikes, kayaks, treadmills, and free weights",
  "Items with an original retail value under $100",
];

/**
 * The pre-registration confirmation email — sent once someone registers
 * for a specific event. Distinct in both purpose and look from the
 * reminder email (a green "confirmed" badge instead of a dark hero), so
 * the two are never mistaken for each other at a glance.
 *
 * The trade-in guidelines list (WE_ACCEPT / WE_DONT_ACCEPT above) is
 * fixed, company-wide policy — same for every region — not a
 * per-coordinator editable field, unlike subject/headline/intro/closing.
 */
export function renderConfirmationEmail(
  content: ConfirmationEmailContent,
  data: ReminderEmailMergeData
): string {
  const subject = renderMergeText(content.subject, data);
  const headline = renderMergeText(content.headline, data);
  const introHtml = renderParagraphs(content.intro, data, "body-copy");
  const closingHtml = renderParagraphs(content.closing, data, "body-copy");

  const acceptItems = WE_ACCEPT.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  const declineItems = WE_DONT_ACCEPT.map((item) => `<li>${escapeHtml(item)}</li>`).join("");

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${subject}</title>
<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700;900&display=swap" rel="stylesheet">
<style>
  * { box-sizing: border-box; }
  body { margin: 0; padding: 40px 20px; background: #F1EFE8; font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; -webkit-font-smoothing: antialiased; }
  .email { max-width: 600px; margin: 0 auto; background: #FFFFFF; box-shadow: 0 4px 20px rgba(37, 60, 50, 0.08); overflow: hidden; }
  .header { background: #02C874; padding: 22px 32px; }
  .header-logo { display: block; height: 34px; width: auto; }
  .confirmed { padding: 36px 32px 8px; text-align: center; }
  .badge { display: inline-flex; align-items: center; justify-content: center; width: 56px; height: 56px; border-radius: 999px; background: #E6FAF1; margin-bottom: 16px; }
  .eyebrow { font-weight: 700; font-size: 12px; letter-spacing: 0.12em; color: #00A85D; text-transform: uppercase; margin: 0 0 10px; }
  .headline { font-weight: 900; font-size: 30px; line-height: 1.15; letter-spacing: -0.01em; color: #171B1F; margin: 0 0 4px; }
  .body { padding: 16px 40px 8px; }
  .body-copy { font-weight: 400; font-size: 16px; line-height: 1.6; color: #171B1F; margin: 0 0 20px; }
  .details { background: #CCDCD4; padding: 22px 24px; margin: 4px 0 28px; border-radius: 4px; }
  .details-eyebrow { font-weight: 700; font-size: 11px; letter-spacing: 0.14em; color: #253C32; text-transform: uppercase; margin: 0 0 12px; }
  .details-row { font-size: 15px; color: #253C32; padding: 6px 0; line-height: 1.5; }
  .details-row .label { font-weight: 700; display: inline-block; min-width: 60px; }
  .guidelines { margin: 8px 0 24px; }
  .guidelines-title { font-weight: 900; font-size: 18px; color: #171B1F; margin: 0 0 16px; }
  .guidelines-cols { display: table; width: 100%; border-spacing: 0; }
  .guidelines-col { display: table-cell; width: 50%; vertical-align: top; padding-right: 16px; }
  .guidelines-col + .guidelines-col { padding-right: 0; padding-left: 16px; }
  .guidelines-heading { font-weight: 700; font-size: 13px; letter-spacing: 0.02em; margin: 0 0 10px; }
  .guidelines-heading.accept { color: #00A85D; }
  .guidelines-heading.decline { color: #D84C4C; }
  .guidelines-list { margin: 0; padding: 0; list-style: none; }
  .guidelines-list li { font-size: 13px; line-height: 1.5; color: #171B1F; padding: 0 0 10px 22px; position: relative; }
  .guidelines-col.accept-col .guidelines-list li::before { content: "✓"; position: absolute; left: 0; top: 0; color: #00A85D; font-weight: 900; }
  .guidelines-col.decline-col .guidelines-list li::before { content: "✕"; position: absolute; left: 0; top: 0; color: #D84C4C; font-weight: 900; }
  .divider { height: 1px; background: #E5E7E4; margin: 8px 0 0; }
  .footer { background: #253C32; padding: 28px 40px; text-align: center; margin-top: 16px; }
  .footer-copy { font-weight: 400; font-size: 12px; line-height: 1.7; color: #CCDCD4; margin: 0; }
  @media (max-width: 620px) {
    body { padding: 16px 0; }
    .confirmed { padding: 28px 24px 8px; }
    .headline { font-size: 24px; }
    .body { padding: 12px 24px 8px; }
    .body-copy { font-size: 15px; }
    .details { padding-left: 18px; padding-right: 18px; }
    .guidelines-cols, .guidelines-col { display: block; width: 100%; padding: 0 !important; }
    .guidelines-col.accept-col { margin-bottom: 20px; }
    .footer { padding: 24px; }
  }
</style>
</head>
<body>
  <div class="email">
    <div class="header">${HEADER_LOGO_SVG_WHITE}</div>
    <div class="confirmed">
      <div class="badge">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#00A85D" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
      </div>
      <p class="eyebrow">Pre-registration confirmed</p>
      <h1 class="headline">${headline}</h1>
    </div>
    <div class="body">
      ${introHtml}
      <div class="details">
        <p class="details-eyebrow">Your event</p>
        <div class="details-row"><span class="label">When</span> ${escapeHtml(data.event_date)}</div>
        <div class="details-row"><span class="label">Where</span> ${escapeHtml(data.event_venue)}</div>
        <div class="details-row"><span class="label">Hours</span> ${escapeHtml(data.event_hours)}</div>
      </div>

      <div class="guidelines">
        <p class="guidelines-title">Trade-in guidelines</p>
        <div class="guidelines-cols">
          <div class="guidelines-col accept-col">
            <p class="guidelines-heading accept">We Accept</p>
            <ul class="guidelines-list">${acceptItems}</ul>
          </div>
          <div class="guidelines-col decline-col">
            <p class="guidelines-heading decline">We Don't Accept</p>
            <ul class="guidelines-list">${declineItems}</ul>
          </div>
        </div>
      </div>

      ${closingHtml}
      <div class="divider"></div>
    </div>
    <div class="footer">
      <p class="footer-copy">${MAILING_ADDRESS}</p>
    </div>
  </div>
</body>
</html>`;
}
