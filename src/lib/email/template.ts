import { formatCentsAsWholeDollars } from "@/lib/money";
import { buildUnsubscribeUrl } from "@/lib/unsubscribe-token";

export type CampaignFields = {
  event_venue: string;
  event_city: string;
  event_dates: string;
  event_hours: string | null;
  bonus_code: string;
};

export type ContactFields = {
  email: string;
  first_name: string | null;
  past_payout_amount_cents: number | null;
};

export type RenderedEmail = {
  subject: string;
  html: string;
  text: string;
};

const MAILING_ADDRESS = "SidelineSwap · 155 Seaport Blvd, Boston, MA 02210";

// Marketing brand palette (vivid-green-primary) — distinct from the
// product UI's forest-primary palette. Do not mix the two.
const VIVID_GREEN = "#02C874";
const FOREST_GREEN = "#253C32";
const MINT = "#CCDCD4";
const WHITE = "#FFFFFF";

/**
 * Renders the one Phase 1 template — the trade-in event invite — for a
 * single recipient. This is the only place merge fields get resolved:
 * everything else in the app treats the rendered HTML as opaque.
 *
 * NOTE: this is built to the brand spec described in the project brief
 * (colors, structure, tagline) since the actual mockup file
 * (sidelineswap-monkeysports-woodbridge-invite.html) hasn't been added to
 * the repo yet. Swap this markup out for the real mockup's HTML once it's
 * available — the merge-field contract below can stay the same.
 */
export function renderInviteEmail(
  contact: ContactFields,
  campaign: CampaignFields
): RenderedEmail {
  const firstName = contact.first_name?.trim() || "there";
  const payout = formatCentsAsWholeDollars(contact.past_payout_amount_cents);
  const unsubscribeUrl = buildUnsubscribeUrl(contact.email);

  const subject = `We're back in ${campaign.event_city}.`;

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(subject)}</title>
  </head>
  <body style="margin:0; padding:0; background-color:#f4f6f5; font-family:Roboto, Arial, Helvetica, sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f5; padding:24px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px; width:100%; background-color:${WHITE}; border-radius:8px; overflow:hidden;">
            <!-- Header band -->
            <tr>
              <td style="background-color:${VIVID_GREEN}; padding:24px 32px;">
                <span style="color:${WHITE}; font-weight:900; font-size:20px; letter-spacing:0.5px;">SidelineSwap</span>
              </td>
            </tr>

            <!-- Headline -->
            <tr>
              <td style="padding:32px 32px 8px 32px;">
                <p style="margin:0 0 16px 0; color:${FOREST_GREEN}; font-size:16px; line-height:1.5;">Hey ${escapeHtml(firstName)},</p>
                <h1 style="margin:0; color:${FOREST_GREEN}; font-weight:900; font-size:28px; line-height:1.25;">
                  We're back in <span style="color:${VIVID_GREEN};">${escapeHtml(campaign.event_city)}</span>.
                </h1>
              </td>
            </tr>

            <!-- Body copy -->
            <tr>
              <td style="padding:8px 32px 24px 32px;">
                <p style="margin:0; color:${FOREST_GREEN}; font-size:16px; line-height:1.6;">
                  Last time, we paid you <strong>${payout}</strong> for your old gear. We're hosting another trade-in
                  event nearby — bring in what's collecting dust and walk out with cash or store credit, plus a little
                  something extra just for our past customers.
                </p>
              </td>
            </tr>

            <!-- Event details card -->
            <tr>
              <td style="padding:0 32px 24px 32px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${MINT}; border-radius:8px;">
                  <tr>
                    <td style="padding:20px 24px;">
                      <p style="margin:0 0 6px 0; color:${FOREST_GREEN}; font-weight:700; font-size:16px;">${escapeHtml(campaign.event_venue)}</p>
                      <p style="margin:0 0 2px 0; color:${FOREST_GREEN}; font-size:14px;">${escapeHtml(campaign.event_dates)}</p>
                      ${campaign.event_hours ? `<p style="margin:0; color:${FOREST_GREEN}; font-size:14px;">${escapeHtml(campaign.event_hours)}</p>` : ""}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Bonus code -->
            <tr>
              <td style="padding:0 32px 32px 32px;" align="center">
                <table role="presentation" cellpadding="0" cellspacing="0" style="background-color:${VIVID_GREEN}; border-radius:6px;">
                  <tr>
                    <td style="padding:14px 28px;">
                      <p style="margin:0; color:${WHITE}; font-weight:700; font-size:18px; letter-spacing:1px;">
                        BONUS CODE: ${escapeHtml(campaign.bonus_code)}
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding:24px 32px; border-top:1px solid ${MINT};">
                <p style="margin:0 0 8px 0; color:#61716A; font-size:12px; line-height:1.6;">
                  Where athletes buy and sell their gear.
                </p>
                <p style="margin:0 0 8px 0; color:#61716A; font-size:12px; line-height:1.6;">
                  ${MAILING_ADDRESS}
                </p>
                <p style="margin:0; color:#61716A; font-size:12px; line-height:1.6;">
                  <a href="${unsubscribeUrl}" style="color:#61716A; text-decoration:underline;">Unsubscribe</a> from these emails.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const text = [
    `Hey ${firstName},`,
    "",
    `We're back in ${campaign.event_city}.`,
    "",
    `Last time, we paid you ${payout} for your old gear. We're hosting another trade-in event nearby — bring in what's collecting dust and walk out with cash or store credit, plus a little something extra just for our past customers.`,
    "",
    campaign.event_venue,
    campaign.event_dates,
    campaign.event_hours ?? "",
    "",
    `Bonus code: ${campaign.bonus_code}`,
    "",
    "Where athletes buy and sell their gear.",
    MAILING_ADDRESS,
    `Unsubscribe: ${unsubscribeUrl}`,
  ].join("\n");

  return { subject, html, text };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
