import { escapeHtml, HEADER_LOGO_SVG_WHITE, MAILING_ADDRESS } from "./shared";
import type { SignupConfirmationEmailSettings } from "@/types";

export type SignupConfirmationMergeData = {
  full_name: string;
  home_city_state: string;
  travel_radius: string;
  desired_areas: string;
  traded_before: string;
};

export const SIGNUP_CONFIRMATION_SAMPLE_MERGE_DATA: SignupConfirmationMergeData = {
  full_name: "Jordan",
  home_city_state: "Cherry Hill, NJ",
  travel_radius: "Within 50 miles",
  desired_areas: "Burlington County NJ, Mercer County NJ (Dick's Princeton)",
  traded_before: "Yes",
};

function renderMergeText(raw: string, data: SignupConfirmationMergeData): string {
  return escapeHtml(raw)
    .replaceAll("{{full_name}}", escapeHtml(data.full_name))
    .replaceAll("{{home_city_state}}", escapeHtml(data.home_city_state))
    .replaceAll("{{travel_radius}}", escapeHtml(data.travel_radius))
    .replaceAll("{{desired_areas}}", escapeHtml(data.desired_areas))
    .replaceAll("{{traded_before}}", escapeHtml(data.traded_before));
}

function renderParagraphs(raw: string, data: SignupConfirmationMergeData, className: string): string {
  return renderMergeText(raw, data)
    .split(/\n{2,}/)
    .map((para) => `<p class="${className}">${para.replace(/\n/g, "<br/>")}</p>`)
    .join("");
}

/**
 * The reminder signup confirmation email — sent the moment someone fills
 * out the public "remind me about the next trade-in event" form, before
 * any specific event exists. Summarizes what they submitted rather than
 * event details (there's no event to describe yet), so it's visually
 * distinct from both the reminder email (dark hero) and the
 * pre-registration confirmation email (trade-in guidelines + referral).
 */
export function renderSignupConfirmationEmail(
  content: SignupConfirmationEmailSettings,
  data: SignupConfirmationMergeData
): string {
  const subject = renderMergeText(content.subject, data);
  const headline = renderMergeText(content.headline, data);
  const introHtml = renderParagraphs(content.intro, data, "body-copy");
  const closingHtml = renderParagraphs(content.closing, data, "body-copy");

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
  .confirmed { padding: 36px 32px 8px; text-align: center; }
  .badge { display: inline-flex; align-items: center; justify-content: center; width: 56px; height: 56px; border-radius: 999px; background: #E6FAF1; margin-bottom: 16px; }
  .eyebrow { font-weight: 700; font-size: 12px; letter-spacing: 0.12em; color: #00A85D; text-transform: uppercase; margin: 0 0 10px; }
  .headline { font-weight: 900; font-size: 30px; line-height: 1.15; letter-spacing: -0.01em; color: #171B1F; margin: 0 0 4px; }
  .body { padding: 16px 40px 8px; }
  .body-copy { font-weight: 400; font-size: 16px; line-height: 1.6; color: #171B1F; margin: 0 0 20px; }
  .details { background: #CCDCD4; padding: 22px 24px; margin: 4px 0 28px; border-radius: 4px; }
  .details-eyebrow { font-weight: 700; font-size: 11px; letter-spacing: 0.14em; color: #253C32; text-transform: uppercase; margin: 0 0 12px; }
  .details-row { font-size: 15px; color: #253C32; padding: 6px 0; line-height: 1.5; }
  .details-row .label { font-weight: 700; display: inline-block; min-width: 110px; }
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
      <p class="eyebrow">Reminder signup confirmed</p>
      <h1 class="headline">${headline}</h1>
    </div>
    <div class="body">
      ${introHtml}
      <div class="details">
        <p class="details-eyebrow">What you told us</p>
        <div class="details-row"><span class="label">Location</span> ${escapeHtml(data.home_city_state)}</div>
        <div class="details-row"><span class="label">Travel distance</span> ${escapeHtml(data.travel_radius)}</div>
        <div class="details-row"><span class="label">Areas</span> ${escapeHtml(data.desired_areas)}</div>
        <div class="details-row"><span class="label">Traded with us before</span> ${escapeHtml(data.traded_before)}</div>
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
