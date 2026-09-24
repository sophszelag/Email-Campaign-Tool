"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { store, newId } from "@/lib/db/store";
import type { ItemCount, Sport } from "@/types";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const preRegSchema = z.object({
  region_id: z.string().trim().min(1),
  event_id: z.string().trim().optional(),
  referred_by: z.string().trim().optional(),
  first_name: z.string().trim().min(1, "First name is required"),
  last_name: z.string().trim().min(1, "Last name is required"),
  email: z.string().trim().min(1, "Email is required"),
  phone: z.string().trim().min(1, "Phone is required"),
  sport: z
    .array(
      z.enum(["baseball", "basketball", "football", "hockey", "lacrosse", "soccer", "softball", "tennis", "other"])
    )
    .min(1, "Select at least one sport"),
  item_count: z.enum(["1-3", "4-7", "8-12", "13+"], { message: "Item count is required" }),
});

export type PreRegResult = { ok: boolean; message: string; referralLink?: string };

export async function submitPreRegistration(formData: FormData): Promise<PreRegResult> {
  const parsed = preRegSchema.safeParse({
    region_id: formData.get("region_id"),
    event_id: formData.get("event_id"),
    referred_by: formData.get("referred_by"),
    first_name: formData.get("first_name"),
    last_name: formData.get("last_name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    sport: formData.getAll("sport"),
    item_count: formData.get("item_count"),
  });

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues.map((i) => i.message).join(", ") };
  }

  const region = store.regions.find((r) => r.id === parsed.data.region_id);
  if (!region) {
    return { ok: false, message: "This registration form isn't available right now." };
  }

  const email = parsed.data.email.trim().toLowerCase();
  if (!EMAIL_RE.test(email)) {
    return { ok: false, message: "Enter a valid email address." };
  }

  const eventId = parsed.data.event_id?.trim() || null;

  // A referral only counts if it points at a real pre-registration for
  // this same event — anything else (stale link, tampered id, an event
  // that's since changed) is silently dropped rather than trusted.
  const rawReferredBy = parsed.data.referred_by?.trim() || null;
  const referrer = rawReferredBy
    ? store.preRegistrations.find((p) => p.id === rawReferredBy && p.event_id === eventId)
    : null;

  const custom_answers: Record<string, string> = {};
  for (const q of region.preregister_form.custom_questions) {
    const value = formData.get(`custom_${q.id}`);
    const trimmed = typeof value === "string" ? value.trim() : "";
    if (q.required && !trimmed) {
      return { ok: false, message: `Please answer: ${q.label}` };
    }
    if (trimmed) custom_answers[q.id] = trimmed;
  }

  const id = newId();

  store.preRegistrations.push({
    id,
    region_id: region.id,
    event_id: eventId,
    first_name: parsed.data.first_name,
    last_name: parsed.data.last_name,
    email,
    phone: parsed.data.phone,
    sports: parsed.data.sport as Sport[],
    item_count: parsed.data.item_count as ItemCount,
    referred_by: referrer?.id ?? null,
    custom_answers,
    created_at: new Date().toISOString(),
  });

  let referralLink: string | undefined;
  if (eventId) {
    const hdrs = await headers();
    const origin = `${hdrs.get("x-forwarded-proto") ?? "https"}://${hdrs.get("host")}`;
    referralLink = `${origin}/preregister/event/${eventId}?ref=${id}`;
  }

  return {
    ok: true,
    message: `Thanks ${parsed.data.first_name}! We've received your information and will have your quote ready soon.`,
    referralLink,
  };
}
