import {
  escapeHtml,
  renderMergeText,
  renderParagraphs,
  HEADER_LOGO_SVG_WHITE,
  MAILING_ADDRESS,
  type EmailContent,
  type ReminderEmailMergeData,
} from "./shared";

/**
 * "Classic" — dark hero section under a green header band, event-details
 * card, single centered CTA. The original design, closest in spirit to
 * the real trade-in-invite mockup this app started from.
 */
export function renderClassicEmail(content: EmailContent, data: ReminderEmailMergeData): string {
  const subject = renderMergeText(content.subject, data);
  const headline = renderMergeText(content.headline, data);
  const introHtml = renderParagraphs(content.intro, data, "body-copy");
  const buttonLabel = renderMergeText(content.button_label, data);
  const closingHtml = renderParagraphs(content.closing, data, "body-copy");
  const preregisterLink = escapeHtml(data.preregister_link);

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
  .hero { background: #253C32; padding: 48px 32px 44px; text-align: center; }
  .eyebrow { font-weight: 700; font-size: 12px; letter-spacing: 0.12em; color: #02C874; text-transform: uppercase; margin: 0 0 14px; }
  .hero-headline { font-weight: 900; font-size: 38px; line-height: 1.1; letter-spacing: -0.02em; color: #FFFFFF; margin: 0; }
  .hero-sub { font-weight: 500; font-size: 15px; color: #CCDCD4; margin: 16px 0 0; letter-spacing: 0.02em; }
  .body { padding: 40px 40px 8px; }
  .body-copy { font-weight: 400; font-size: 16px; line-height: 1.6; color: #171B1F; margin: 0 0 20px; }
  .details { background: #CCDCD4; padding: 22px 24px; margin: 4px 0 28px; border-radius: 4px; }
  .details-eyebrow { font-weight: 700; font-size: 11px; letter-spacing: 0.14em; color: #253C32; text-transform: uppercase; margin: 0 0 12px; }
  .details-row { font-size: 15px; color: #253C32; padding: 6px 0; line-height: 1.5; }
  .details-row .label { font-weight: 700; display: inline-block; min-width: 60px; }
  .cta-wrap { text-align: center; padding: 8px 0 28px; }
  .cta { display: inline-block; background: #253C32; color: #FFFFFF !important; text-decoration: none; font-weight: 700; font-size: 15px; letter-spacing: 0.02em; padding: 16px 40px; border-radius: 4px; }
  .divider { height: 1px; background: #E5E7E4; margin: 8px 40px 0; }
  .tagline-block { padding: 28px 40px 24px; text-align: center; }
  .tagline { font-weight: 500; font-style: italic; font-size: 14px; color: #253C32; margin: 0; letter-spacing: 0.01em; }
  .footer { background: #253C32; padding: 28px 40px; text-align: center; }
  .footer-copy { font-weight: 400; font-size: 12px; line-height: 1.7; color: #CCDCD4; margin: 0; }
  @media (max-width: 620px) {
    body { padding: 16px 0; }
    .header { padding: 18px 24px; }
    .header-logo { height: 28px; }
    .hero { padding: 36px 24px 32px; }
    .hero-headline { font-size: 28px; }
    .body { padding: 30px 24px 8px; }
    .body-copy { font-size: 15px; }
    .footer { padding: 24px; }
    .cta { padding: 14px 28px; font-size: 14px; }
    .details { padding-left: 18px; padding-right: 18px; }
  }
</style>
</head>
<body>
  <div class="email">
    <div class="header">${HEADER_LOGO_SVG_WHITE}</div>
    <div class="hero">
      <p class="eyebrow">Trade-in event reminder</p>
      <h1 class="hero-headline">${headline}</h1>
      <p class="hero-sub">${escapeHtml(data.event_date)} · ${escapeHtml(data.event_venue)}</p>
    </div>
    <div class="body">
      ${introHtml}
      <div class="details">
        <p class="details-eyebrow">Event details</p>
        <div class="details-row"><span class="label">When</span> ${escapeHtml(data.event_date)}</div>
        <div class="details-row"><span class="label">Where</span> ${escapeHtml(data.event_venue)}</div>
      </div>
      <div class="cta-wrap">
        <a href="${preregisterLink}" class="cta">${buttonLabel} →</a>
      </div>
      ${closingHtml}
      <div class="divider"></div>
    </div>
    <div class="tagline-block">
      <p class="tagline">Where athletes buy and sell their gear.</p>
    </div>
    <div class="footer">
      <p class="footer-copy">${MAILING_ADDRESS}</p>
    </div>
  </div>
</body>
</html>`;
}
