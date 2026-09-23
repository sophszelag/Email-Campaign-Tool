"use server";

import { z } from "zod";
import { store, newId } from "@/lib/db/store";
import type { ItemCount, Sport } from "@/types";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const preRegSchema = z.object({
  region_id: z.string().trim().min(1),
  first_name: z.string().trim().min(1, "First name is required"),
  last_name: z.string().trim().min(1, "Last name is required"),
  email: z.string().trim().min(1, "Email is required"),
  phone: z.string().trim().min(1, "Phone is required"),
  sport: z.enum(
    ["baseball", "basketball", "football", "hockey", "lacrosse", "soccer", "softball", "tennis", "other"],
    { message: "Sport is required" }
  ),
  item_count: z.enum(["1-3", "4-7", "8-12", "13+"], { message: "Item count is required" }),
  has_referral_code: z.enum(["yes", "no"], { message: "Please answer this question" }),
  referral_code: z.string().trim().optional(),
});

export type PreRegResult = { ok: boolean; message: string };

export async function submitPreRegistration(formData: FormData): Promise<PreRegResult> {
  const parsed = preRegSchema.safeParse({
    region_id: formData.get("region_id"),
    first_name: formData.get("first_name"),
    last_name: formData.get("last_name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    sport: formData.get("sport"),
    item_count: formData.get("item_count"),
    has_referral_code: formData.get("has_referral_code"),
    referral_code: formData.get("referral_code"),
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

  const hasReferralCode = parsed.data.has_referral_code === "yes";
  const referralCode = parsed.data.referral_code?.trim() || null;
  if (hasReferralCode && !referralCode) {
    return { ok: false, message: "Enter your referral or promo code, or choose “No” above." };
  }

  store.preRegistrations.push({
    id: newId(),
    region_id: region.id,
    first_name: parsed.data.first_name,
    last_name: parsed.data.last_name,
    email,
    phone: parsed.data.phone,
    sport: parsed.data.sport as Sport,
    item_count: parsed.data.item_count as ItemCount,
    has_referral_code: hasReferralCode,
    referral_code: hasReferralCode ? referralCode : null,
    created_at: new Date().toISOString(),
  });

  return {
    ok: true,
    message: `Thanks ${parsed.data.first_name}! We've received your information and will have your quote ready soon.`,
  };
}
