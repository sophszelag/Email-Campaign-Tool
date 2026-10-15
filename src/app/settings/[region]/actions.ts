"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/session";
import { store } from "@/lib/db/store";
import type { EmailTemplateId } from "@/types";

const VALID_TEMPLATE_IDS: EmailTemplateId[] = ["classic", "minimal", "bold"];

export async function updateReminderEmailSettings(regionId: string, formData: FormData) {
  await requireSession();
  const region = store.regions.find((r) => r.id === regionId);
  if (!region) return;

  const templateId = formData.get("template_id") as string | null;
  const subject = (formData.get("subject") as string | null)?.trim();
  const headline = (formData.get("headline") as string | null)?.trim();
  const intro = (formData.get("intro") as string | null)?.trim();
  const buttonLabel = (formData.get("button_label") as string | null)?.trim();
  const closing = (formData.get("closing") as string | null)?.trim();
  const daysRaw = formData.get("send_days_before_event");
  const days = typeof daysRaw === "string" ? Number.parseInt(daysRaw, 10) : NaN;
  const replyToEmail = (formData.get("reply_to_email") as string | null)?.trim() ?? "";

  if (templateId && (VALID_TEMPLATE_IDS as string[]).includes(templateId)) {
    region.reminder_email.template_id = templateId as EmailTemplateId;
  }
  if (subject) region.reminder_email.subject = subject;
  if (headline) region.reminder_email.headline = headline;
  if (intro) region.reminder_email.intro = intro;
  if (buttonLabel) region.reminder_email.button_label = buttonLabel;
  if (closing) region.reminder_email.closing = closing;
  if (Number.isFinite(days) && days > 0) region.reminder_email.send_days_before_event = days;
  region.reminder_email.reply_to_email = replyToEmail;

  revalidatePath(`/settings/${region.slug}/reminder`);
}

export async function updateConfirmationEmailSettings(regionId: string, formData: FormData) {
  await requireSession();
  const region = store.regions.find((r) => r.id === regionId);
  if (!region) return;

  const subject = (formData.get("subject") as string | null)?.trim();
  const headline = (formData.get("headline") as string | null)?.trim();
  const intro = (formData.get("intro") as string | null)?.trim();
  const closing = (formData.get("closing") as string | null)?.trim();

  if (subject) region.confirmation_email.subject = subject;
  if (headline) region.confirmation_email.headline = headline;
  if (intro) region.confirmation_email.intro = intro;
  if (closing) region.confirmation_email.closing = closing;

  revalidatePath(`/settings/${region.slug}/confirmation`);
}

export async function updateSignupConfirmationEmailSettings(regionId: string, formData: FormData) {
  await requireSession();
  const region = store.regions.find((r) => r.id === regionId);
  if (!region) return;

  const subject = (formData.get("subject") as string | null)?.trim();
  const headline = (formData.get("headline") as string | null)?.trim();
  const intro = (formData.get("intro") as string | null)?.trim();
  const closing = (formData.get("closing") as string | null)?.trim();

  if (subject) region.signup_confirmation_email.subject = subject;
  if (headline) region.signup_confirmation_email.headline = headline;
  if (intro) region.signup_confirmation_email.intro = intro;
  if (closing) region.signup_confirmation_email.closing = closing;

  revalidatePath(`/settings/${region.slug}/signup-confirmation`);
}

export async function updateFeatureToggles(regionId: string, formData: FormData) {
  await requireSession();
  const region = store.regions.find((r) => r.id === regionId);
  if (!region) return;

  region.features.reminder_signup = formData.get("reminder_signup") === "on";
  region.features.pre_registration = formData.get("pre_registration") === "on";
  region.features.referral_program = formData.get("referral_program") === "on";

  revalidatePath(`/settings/${region.slug}/features`);
  revalidatePath(`/settings/${region.slug}`);
}

export async function updateReferralProgramSettings(regionId: string, formData: FormData) {
  await requireSession();
  const region = store.regions.find((r) => r.id === regionId);
  if (!region) return;

  const perReferral = Number.parseInt(formData.get("per_referral_percent") as string, 10);
  const max = Number.parseInt(formData.get("max_percent") as string, 10);

  if (Number.isFinite(perReferral) && perReferral > 0) {
    region.referral_program.per_referral_percent = perReferral;
  }
  if (Number.isFinite(max) && max > 0) {
    region.referral_program.max_percent = max;
  }

  revalidatePath(`/settings/${region.slug}/referral-program`);
}

export async function addSubregionOption(regionId: string, formData: FormData) {
  await requireSession();
  const region = store.regions.find((r) => r.id === regionId);
  if (!region) return;

  const label = (formData.get("label") as string | null)?.trim();
  if (label && !region.subregion_options.includes(label)) {
    region.subregion_options.push(label);
  }

  revalidatePath(`/settings/${region.slug}/areas`);
}

export async function removeSubregionOption(regionId: string, label: string) {
  await requireSession();
  const region = store.regions.find((r) => r.id === regionId);
  if (!region) return;

  region.subregion_options = region.subregion_options.filter((option) => option !== label);

  revalidatePath(`/settings/${region.slug}/areas`);
}
