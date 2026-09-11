"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/session";
import { renderInviteEmail } from "@/lib/email/template";
import { sendCampaignEmail } from "@/lib/email/resend";
import { store, newId } from "@/lib/db/store";
import type { Campaign, Contact } from "@/types";

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

  const now = new Date().toISOString();
  const campaign: Campaign = {
    id: newId(),
    name: parsed.data.name,
    template_id: "monkeysports_invite",
    event_venue: parsed.data.event_venue,
    event_city: parsed.data.event_city,
    event_state: parsed.data.event_state || null,
    event_dates: parsed.data.event_dates,
    event_hours: parsed.data.event_hours || null,
    accepted_categories: parsed.data.accepted_categories || null,
    bonus_code: parsed.data.bonus_code,
    status: "draft",
    sent_at: null,
    created_by: session.user!.email ?? null,
    created_at: now,
  };
  store.campaigns.push(campaign);

  for (const contactId of contactIds) {
    store.campaignRecipients.push({
      id: newId(),
      campaign_id: campaign.id,
      contact_id: contactId,
      personalized_preview: null,
      status: "queued",
      resend_email_id: null,
      sent_at: null,
      created_at: now,
    });
  }

  revalidatePath("/dashboard");
  redirect(`/campaigns/${campaign.id}`);
}

export async function sendTestEmail(campaignId: string): Promise<{ ok: boolean; message: string }> {
  const session = await requireSession();
  const testEmail = session.user!.email!;

  const campaign = store.campaigns.find((c) => c.id === campaignId);
  if (!campaign) {
    return { ok: false, message: "Campaign not found." };
  }

  // Use the first real recipient's data for a representative preview, or
  // sane placeholders if the campaign has none yet.
  const firstRecipient = store.campaignRecipients.find((r) => r.campaign_id === campaignId);
  const firstContact = firstRecipient
    ? store.contacts.find((c) => c.id === firstRecipient.contact_id)
    : undefined;

  const sampleContact: Contact | { email: string; first_name: string; past_payout_amount_cents: number } =
    firstContact ?? {
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

  const campaign = store.campaigns.find((c) => c.id === campaignId);
  if (!campaign) {
    return { ok: false, message: "Campaign not found." };
  }
  if (campaign.status === "sent") {
    return { ok: false, message: "This campaign has already been sent." };
  }

  const recipients = store.campaignRecipients.filter(
    (r) => r.campaign_id === campaignId && r.status === "queued"
  );
  if (recipients.length === 0) {
    return { ok: false, message: "No queued recipients to send to." };
  }

  campaign.status = "sending";

  const suppressedEmails = new Set(store.suppressions.map((s) => s.email));

  let sentCount = 0;
  let suppressedCount = 0;
  let failedCount = 0;

  for (const recipient of recipients) {
    const contact = store.contacts.find((c) => c.id === recipient.contact_id);
    if (!contact) {
      failedCount += 1;
      recipient.status = "failed";
      continue;
    }

    if (suppressedEmails.has(contact.email)) {
      recipient.status = "unsubscribed";
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
      recipient.status = "failed";
      continue;
    }

    sentCount += 1;
    recipient.status = "sent";
    recipient.resend_email_id = id;
    recipient.personalized_preview = rendered.html;
    recipient.sent_at = new Date().toISOString();
  }

  campaign.status = "sent";
  campaign.sent_at = new Date().toISOString();

  revalidatePath(`/campaigns/${campaignId}`);
  revalidatePath("/dashboard");

  return {
    ok: failedCount === 0,
    message: `Sent ${sentCount}. Skipped ${suppressedCount} suppressed. ${failedCount} failed.`,
  };
}
