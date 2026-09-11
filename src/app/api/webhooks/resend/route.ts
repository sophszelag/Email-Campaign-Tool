import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";
import { getSupabaseServerClient } from "@/lib/supabase/server";

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

  const supabase = getSupabaseServerClient();
  const { data: recipient } = await supabase
    .from("campaign_recipients")
    .select("id, contact_id, contacts(email)")
    .eq("resend_email_id", emailId)
    .maybeSingle();

  if (!recipient) {
    return NextResponse.json({ ok: true }); // unrelated send (e.g. a test email), ignore
  }

  const recipientEmail = (recipient.contacts as unknown as { email: string } | null)?.email;

  switch (event.type) {
    case "email.delivered":
      await supabase.from("campaign_recipients").update({ status: "delivered" }).eq("id", recipient.id);
      await supabase.from("campaign_events").insert({ recipient_id: recipient.id, event_type: "delivered" });
      break;

    case "email.opened":
      await supabase.from("campaign_events").insert({ recipient_id: recipient.id, event_type: "open" });
      break;

    case "email.clicked":
      await supabase.from("campaign_events").insert({
        recipient_id: recipient.id,
        event_type: "click",
        url: event.data.click?.link ?? null,
      });
      break;

    case "email.bounced":
      await supabase.from("campaign_recipients").update({ status: "bounced" }).eq("id", recipient.id);
      await supabase.from("campaign_events").insert({ recipient_id: recipient.id, event_type: "bounce" });
      if (recipientEmail) {
        await supabase
          .from("suppressions")
          .upsert({ email: recipientEmail, reason: "bounced" }, { onConflict: "email" });
      }
      break;

    case "email.complained":
      await supabase.from("campaign_recipients").update({ status: "complained" }).eq("id", recipient.id);
      await supabase.from("campaign_events").insert({ recipient_id: recipient.id, event_type: "complaint" });
      if (recipientEmail) {
        await supabase
          .from("suppressions")
          .upsert({ email: recipientEmail, reason: "complained" }, { onConflict: "email" });
      }
      break;

    default:
      break; // email.sent, email.delivery_delayed, etc. — nothing to record for Phase 1
  }

  return NextResponse.json({ ok: true });
}
