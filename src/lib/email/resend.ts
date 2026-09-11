import { Resend } from "resend";

// Sends from a subdomain (mail.sidelineswap.com) to protect the main
// domain's Gmail reputation, per the brief. Brendan needs to verify this
// sending domain in Resend (SPF/DKIM/DMARC) before real sends work.
const FROM_ADDRESS = process.env.CAMPAIGN_FROM_ADDRESS ?? "SidelineSwap Events <events@mail.sidelineswap.com>";

let client: Resend | null = null;

function getResendClient(): Resend {
  if (!client) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error("RESEND_API_KEY is not set.");
    }
    client = new Resend(apiKey);
  }
  return client;
}

export async function sendCampaignEmail(params: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<{ id: string | null; error: string | null }> {
  const { data, error } = await getResendClient().emails.send({
    from: FROM_ADDRESS,
    to: params.to,
    subject: params.subject,
    html: params.html,
    text: params.text,
  });

  if (error) {
    return { id: null, error: error.message };
  }
  return { id: data?.id ?? null, error: null };
}
