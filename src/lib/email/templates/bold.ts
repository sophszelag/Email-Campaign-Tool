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
 * "Bold" — full-bleed green hero with the headline over it, a large
 * CTA button near the top as well as the bottom, high contrast
 * throughout. For a coordinator who wants this to read as an event
 * promo, not a quiet heads-up.
 */
export function renderBoldEmail(content: EmailContent, data: ReminderEmailMergeData): string {
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
  body { margin: 0; padding: 32px 16px; background: #E0EBE3; font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; -webkit-font-smoothing: antialiased; }
  .email { max-width: 600px; margin: 0 auto; background: #FFFFFF; overflow: hidden; border-radius: 8px; box-shadow: 0 8px 30px rgba(37, 60, 50, 0.14); }
  .hero { background: #02C874; padding: 32px 32px 40px; }
  .hero-logo { margin-bottom: 28px; }
  .hero-logo svg path { fill: #253C32 !important; }
  .eyebrow { display: inline-block; font-weight: 900; font-size: 11px; letter-spacing: 0.14em; color: #FFFFFF; background: #253C32; text-transform: uppercase; margin: 0 0 16px; padding: 6px 12px; border-radius: 100px; }
  .hero-headline { font-weight: 900; font-size: 42px; line-height: 1.05; letter-spacing: -0.02em; color: #171B1F; margin: 0 0 14px; }
  .hero-sub { font-weight: 700; font-size: 16px; color: #171B1F; margin: 0 0 24px; }
  .hero-cta { display: inline-block; background: #171B1F; color: #FFFFFF !important; text-decoration: none; font-weight: 900; font-size: 16px; letter-spacing: 0.01em; padding: 18px 36px; border-radius: 4px; }
  .body { padding: 40px 36px 8px; }
  .body-copy { font-weight: 400; font-size: 16px; line-height: 1.65; color: #171B1F; margin: 0 0 20px; }
  .details { background: #171B1F; padding: 24px 28px; margin: 8px 0 32px; border-radius: 6px; }
  .details-eyebrow { font-weight: 900; font-size: 11px; letter-spacing: 0.14em; color: #02C874; text-transform: uppercase; margin: 0 0 14px; }
  .details-row { font-size: 16px; color: #FFFFFF; padding: 6px 0; line-height: 1.5; }
  .details-row .label { font-weight: 900; display: inline-block; min-width: 64px; color: #7FE0AF; }
  .cta-wrap { text-align: center; padding: 8px 0 32px; }
  .cta { display: inline-block; background: #02C874; color: #0B2015 !important; text-decoration: none; font-weight: 900; font-size: 17px; letter-spacing: 0.01em; padding: 20px 48px; border-radius: 4px; }
  .footer { background: #F1EFE8; padding: 28px 36px; text-align: center; }
  .footer-copy { font-weight: 500; font-size: 12px; line-height: 1.7; color: #61716A; margin: 0; }
  @media (max-width: 620px) {
    body { padding: 20px 0; }
    .hero { padding: 24px 24px 32px; }
    .hero-headline { font-size: 32px; }
    .body { padding: 30px 24px 8px; }
    .footer { padding: 24px; }
    .cta, .hero-cta { padding: 16px 28px; font-size: 15px; }
    .details { padding: 20px; }
  }
</style>
</head>
<body>
  <div class="email">
    <div class="hero">
      <div class="hero-logo">${HEADER_LOGO_SVG_WHITE.replace('fill="white"', 'fill="#253C32"')}</div>
      <p class="eyebrow">Trade-in event</p>
      <h1 class="hero-headline">${headline}</h1>
      <p class="hero-sub">${escapeHtml(data.event_date)} · ${escapeHtml(data.event_venue)}</p>
      <a href="${preregisterLink}" class="hero-cta">${buttonLabel} →</a>
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
    </div>
    <div class="footer">
      <p class="footer-copy">${MAILING_ADDRESS}</p>
    </div>
  </div>
</body>
</html>`;
}
