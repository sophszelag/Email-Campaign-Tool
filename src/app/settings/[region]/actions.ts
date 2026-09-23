"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/session";
import { store } from "@/lib/db/store";

export async function updateReminderEmailSettings(regionId: string, formData: FormData) {
  await requireSession();
  const region = store.regions.find((r) => r.id === regionId);
  if (!region) return;

  const subject = (formData.get("subject") as string | null)?.trim();
  const body = (formData.get("body") as string | null)?.trim();
  const daysRaw = formData.get("send_days_before_event");
  const days = typeof daysRaw === "string" ? Number.parseInt(daysRaw, 10) : NaN;

  if (subject) region.reminder_email.subject = subject;
  if (body) region.reminder_email.body = body;
  if (Number.isFinite(days) && days > 0) region.reminder_email.send_days_before_event = days;

  revalidatePath(`/settings/${region.slug}`);
}
