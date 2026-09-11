"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/session";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { renderInviteEmail } from "@/lib/email/template";
import { sendCampaignEmail } from "@/lib/email/resend";
import type { Contact } from "@/types";

const campaignSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  event_venue: z.string().trim().min(1, "Venue is required"),
  event_city: z.string().trim().min(1, "City is required"),
  event_state: z.string().trim().optional(),
  event_dates: z.string().trim().min(1, "Dates are required"),
  event_hours: z.string().trim().optional(),
  accepted_categories: z.string().trim().optional(),
  bonus_code: z.string().trim().min(1, "Bonus code is required"),
});

export type CreateCampaignResult = { ok: false; message: string } | never;

export async function createCampaign(formData: FormData): Promise<CreateCampaignResult> {
  const session = await requireSession();

  const parsed = campaignSchema.safeParse({
    name: formData.get("name"),
    event_venue: formData.get("event_venue"),
    event_city: formData.get("event_city"),
    event_state: formData.get("event_state"),
    event_dates: formData.get("event_dates"),
    event_hours: formData.get("event_hours"),
    accepted_categories: formData.get("accepted_categories"),
    bonus_code: formData.get("bonus_code"),
  });

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues.map((i) => i.message).join(", ") };
  }

  const contactIds = formData.getAll("contact_ids").map(String).filter(Boolean);
  if (contactIds.length === 0) {
    return { ok: false, message: "Select at least one recipient." };
  }

  const supabase = getSupabaseServerClient();

  const { data: campaign, error: campaignError } = await supabase
    .from("campaigns")
    .insert({
      name: parsed.data.name,
      event_venue: parsed.data.event_venue,
      event_city: parsed.data.event_city,
      event_state: parsed.data.event_state || null,
      event_dates: parsed.data.event_dates,
      event_hours: parsed.data.event_hours || null,
      accepted_categories: parsed.data.accepted_categories || null,
      bonus_code: parsed.data.bonus_code,
      created_by: session.user!.email,
    })
    .select()
    .single();

  if (campaignError || !campaign) {
    return { ok: false, message: `Couldn't create campaign: ${campaignError?.message}` };
  }

  const { error: recipientsError } = await supabase.from("campaign_recipients").insert(
    contactIds.map((contactId) => ({
      campaign_id: campaign.id,
      contact_id: contactId,
    }))
  );

  if (recipientsError) {
    return { ok: false, message: `Campaign created, but couldn't add recipients: ${recipientsError.message}` };
  }

  revalidatePath("/dashboard");
  redirect(`/campaigns/${campaign.id}`);
}

export async function sendTestEmail(campaignId: string): Promise<{ ok: boolean; message: string }> {
  const session = await requireSession();
  const testEmail = session.user!.email!;

  const supabase = getSupabaseServerClient();
  const { data: campaign, error: campaignError } = await supabase
    .from("campaigns")
    .select("*")
    .eq("id", campaignId)
    .single();

  if (campaignError || !campaign) {
    return { ok: false, message: "Campaign not found." };
  }

  // Use the first real recipient's data for a representative preview, or
  // sane placeholders if the campaign has none yet.
  const { data: firstRecipient } = await supabase
    .from("campaign_recipients")
    .select("contacts(*)")
    .eq("campaign_id", campaignId)
    .limit(1)
    .maybeSingle();

  const sampleContact = (firstRecipient?.contacts as unknown as Contact | null) ?? {
    email: testEmail,
    first_name: "Alex",
    past_payout_amount_cents: 48700,
  };

  const rendered = renderInviteEmail(
    { ...sampleContact, email: testEmail },
    {
      event_venue: campaign.event_venue,
      event_city: campaign.event_city,
      event_state: campaign.event_state,
      event_dates: campaign.event_dates,
      event_hours: campaign.event_hours,
      accepted_categories: campaign.accepted_categories,
      bonus_code: campaign.bonus_code,
    }
  );

  const { error } = await sendCampaignEmail({
    to: testEmail,
    subject: `[TEST] ${rendered.subject}`,
    html: rendered.html,
    text: rendered.text,
  });

  if (error) {
    return { ok: false, message: `Send failed: ${error}` };
  }
  return { ok: true, message: `Test email sent to ${testEmail}.` };
}

/**
 * The real send. Renders + sends one email per recipient, skipping anyone
 * on the suppression list, and records the outcome on each recipient row.
 * There's no batching/queueing here — fine for Phase 1's per-event
 * volumes, but this should move to a background job before sending to a
 * much larger list.
 */
export async function sendCampaign(campaignId: string): Promise<{ ok: boolean; message: string }> {
  await requireSession();

  const supabase = getSupabaseServerClient();

  const { data: campaign, error: campaignError } = await supabase
    .from("campaigns")
    .select("*")
    .eq("id", campaignId)
    .single();

  if (campaignError || !campaign) {
    return { ok: false, message: "Campaign not found." };
  }
  if (campaign.status === "sent") {
    return { ok: false, message: "This campaign has already been sent." };
  }

  const { data: recipients, error: recipientsError } = await supabase
    .from("campaign_recipients")
    .select("*, contacts(*)")
    .eq("campaign_id", campaignId)
    .eq("status", "queued");

  if (recipientsError) {
    return { ok: false, message: `Couldn't load recipients: ${recipientsError.message}` };
  }
  if (!recipients || recipients.length === 0) {
    return { ok: false, message: "No queued recipients to send to." };
  }

  await supabase.from("campaigns").update({ status: "sending" }).eq("id", campaignId);

  const { data: suppressions } = await supabase.from("suppressions").select("email");
  const suppressedEmails = new Set((suppressions ?? []).map((s) => s.email));

  let sentCount = 0;
  let suppressedCount = 0;
  let failedCount = 0;

  for (const recipient of recipients) {
    const contact = recipient.contacts as unknown as Contact;

    if (suppressedEmails.has(contact.email)) {
      await supabase
        .from("campaign_recipients")
        .update({ status: "unsubscribed" })
        .eq("id", recipient.id);
      suppressedCount += 1;
      continue;
    }

    const rendered = renderInviteEmail(contact, {
      event_venue: campaign.event_venue,
      event_city: campaign.event_city,
      event_state: campaign.event_state,
      event_dates: campaign.event_dates,
      event_hours: campaign.event_hours,
      accepted_categories: campaign.accepted_categories,
      bonus_code: campaign.bonus_code,
    });

    const { id, error } = await sendCampaignEmail({
      to: contact.email,
      subject: rendered.subject,
      html: rendered.html,
      text: rendered.text,
    });

    if (error) {
      failedCount += 1;
      await supabase.from("campaign_recipients").update({ status: "failed" }).eq("id", recipient.id);
      continue;
    }

    sentCount += 1;
    await supabase
      .from("campaign_recipients")
      .update({
        status: "sent",
        resend_email_id: id,
        personalized_preview: rendered.html,
        sent_at: new Date().toISOString(),
      })
      .eq("id", recipient.id);
  }

  await supabase
    .from("campaigns")
    .update({ status: "sent", sent_at: new Date().toISOString() })
    .eq("id", campaignId);

  revalidatePath(`/campaigns/${campaignId}`);
  revalidatePath("/dashboard");

  return {
    ok: failedCount === 0,
    message: `Sent ${sentCount}. Skipped ${suppressedCount} suppressed. ${failedCount} failed.`,
  };
}
