"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/session";
import { store } from "@/lib/db/store";

export async function updateReminderEmailSettings(regionId: string, formData: FormData) {
  await requireSession();
  const region = store.regions.find((r) => r.id === regionId);
  if (!region) return;

  const subject = (formData.get("subject") as string | null)?.trim();
  const headline = (formData.get("headline") as string | null)?.trim();
  const intro = (formData.get("intro") as string | null)?.trim();
  const buttonLabel = (formData.get("button_label") as string | null)?.trim();
  const closing = (formData.get("closing") as string | null)?.trim();
  const daysRaw = formData.get("send_days_before_event");
  const days = typeof daysRaw === "string" ? Number.parseInt(daysRaw, 10) : NaN;
  const replyToEmail = (formData.get("reply_to_email") as string | null)?.trim() ?? "";

  if (subject) region.reminder_email.subject = subject;
  if (headline) region.reminder_email.headline = headline;
  if (intro) region.reminder_email.intro = intro;
  if (buttonLabel) region.reminder_email.button_label = buttonLabel;
  if (closing) region.reminder_email.closing = closing;
  if (Number.isFinite(days) && days > 0) region.reminder_email.send_days_before_event = days;
  region.reminder_email.reply_to_email = replyToEmail;

  revalidatePath(`/settings/${region.slug}`);
}
