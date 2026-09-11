import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";
import { store, newId, upsertSuppression } from "@/lib/db/store";

type ResendWebhookEvent = {
  type: string;
  data: {
    email_id?: string;
    click?: { link?: string };
  };
};

// Public endpoint — Resend posts delivery/open/click/bounce/complaint
// events here (configure this URL in the Resend dashboard). Signed with
// Svix; RESEND_WEBHOOK_SECRET is the "whsec_..." value Resend gives you
// for this webhook.
export async function POST(request: NextRequest) {
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  const payload = await request.text();
  const headers = {
    "svix-id": request.headers.get("svix-id") ?? "",
    "svix-timestamp": request.headers.get("svix-timestamp") ?? "",
    "svix-signature": request.headers.get("svix-signature") ?? "",
  };

  let event: ResendWebhookEvent;
  try {
    event = new Webhook(secret).verify(payload, headers) as unknown as ResendWebhookEvent;
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const emailId = event.data.email_id;
  if (!emailId) {
    return NextResponse.json({ ok: true }); // nothing to correlate, ignore
  }

  const recipient = store.campaignRecipients.find((r) => r.resend_email_id === emailId);
  if (!recipient) {
    return NextResponse.json({ ok: true }); // unrelated send (e.g. a test email), ignore
  }

  const recipientEmail = store.contacts.find((c) => c.id === recipient.contact_id)?.email;

  switch (event.type) {
    case "email.delivered":
      recipient.status = "delivered";
      store.campaignEvents.push({
        id: newId(),
        recipient_id: recipient.id,
        event_type: "delivered",
        url: null,
        occurred_at: new Date().toISOString(),
      });
      break;

    case "email.opened":
      store.campaignEvents.push({
        id: newId(),
        recipient_id: recipient.id,
        event_type: "open",
        url: null,
        occurred_at: new Date().toISOString(),
      });
      break;

    case "email.clicked":
      store.campaignEvents.push({
        id: newId(),
        recipient_id: recipient.id,
        event_type: "click",
        url: event.data.click?.link ?? null,
        occurred_at: new Date().toISOString(),
      });
      break;

    case "email.bounced":
      recipient.status = "bounced";
      store.campaignEvents.push({
        id: newId(),
        recipient_id: recipient.id,
        event_type: "bounce",
        url: null,
        occurred_at: new Date().toISOString(),
      });
      if (recipientEmail) upsertSuppression(recipientEmail, "bounced");
      break;

    case "email.complained":
      recipient.status = "complained";
      store.campaignEvents.push({
        id: newId(),
        recipient_id: recipient.id,
        event_type: "complaint",
        url: null,
        occurred_at: new Date().toISOString(),
      });
      if (recipientEmail) upsertSuppression(recipientEmail, "complained");
      break;

    default:
      break; // email.sent, email.delivery_delayed, etc. — nothing to record for Phase 1
  }

  return NextResponse.json({ ok: true });
}
