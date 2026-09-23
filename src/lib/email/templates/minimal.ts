import {
  escapeHtml,
  renderMergeText,
  renderParagraphs,
  MAILING_ADDRESS,
  type EmailContent,
  type ReminderEmailMergeData,
} from "./shared";

/**
 * "Minimal" — plain white background throughout, left-aligned headline,
 * a text wordmark instead of the graphic logo, and a understated button.
 * For a coordinator who wants something that reads as a plain heads-up
 * rather than a marketing blast.
 */
export function renderMinimalEmail(content: EmailContent, data: ReminderEmailMergeData): string {
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
  body { margin: 0; padding: 40px 20px; background: #FFFFFF; font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; -webkit-font-smoothing: antialiased; }
  .email { max-width: 560px; margin: 0 auto; }
  .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #171B1F; padding-bottom: 14px; margin-bottom: 36px; }
  .wordmark { font-weight: 900; font-size: 17px; letter-spacing: -0.01em; color: #171B1F; margin: 0; }
  .eyebrow { font-weight: 700; font-size: 11px; letter-spacing: 0.12em; color: #61716A; text-transform: uppercase; margin: 0; }
  .headline { font-weight: 900; font-size: 30px; line-height: 1.2; letter-spacing: -0.01em; color: #171B1F; margin: 0 0 6px; }
  .sub { font-weight: 500; font-size: 14px; color: #61716A; margin: 0 0 28px; }
  .body-copy { font-weight: 400; font-size: 15px; line-height: 1.65; color: #171B1F; margin: 0 0 20px; }
  .rule { height: 1px; background: #E5E7E4; margin: 24px 0; }
  .details-row { font-size: 14px; color: #171B1F; padding: 5px 0; line-height: 1.5; }
  .details-row .label { font-weight: 700; display: inline-block; min-width: 56px; color: #61716A; text-transform: uppercase; font-size: 11px; letter-spacing: 0.08em; }
  .cta-wrap { padding: 28px 0 8px; }
  .cta { display: inline-block; background: #02C874; color: #0B2015 !important; text-decoration: none; font-weight: 700; font-size: 14px; letter-spacing: 0.02em; padding: 13px 28px; border-radius: 3px; }
  .footer { margin-top: 36px; border-top: 1px solid #E5E7E4; padding-top: 18px; }
  .footer-copy { font-weight: 400; font-size: 12px; line-height: 1.7; color: #61716A; margin: 0; }
  @media (max-width: 620px) {
    body { padding: 24px 16px; }
    .headline { font-size: 24px; }
  }
</style>
</head>
<body>
  <div class="email">
    <div class="header">
      <p class="wordmark">SidelineSwap</p>
      <p class="eyebrow">Trade-in reminder</p>
    </div>

    <h1 class="headline">${headline}</h1>
    <p class="sub">${escapeHtml(data.event_date)} · ${escapeHtml(data.event_venue)}</p>

    ${introHtml}

    <div class="rule"></div>
    <div class="details-row"><span class="label">When</span> ${escapeHtml(data.event_date)}</div>
    <div class="details-row"><span class="label">Where</span> ${escapeHtml(data.event_venue)}</div>
    <div class="rule"></div>

    <div class="cta-wrap">
      <a href="${preregisterLink}" class="cta">${buttonLabel}</a>
    </div>

    ${closingHtml}

    <div class="footer">
      <p class="footer-copy">${MAILING_ADDRESS}</p>
    </div>
  </div>
</body>
</html>`;
}
