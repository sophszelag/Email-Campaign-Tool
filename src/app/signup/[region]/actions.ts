"use server";

import { z } from "zod";
import { store, newId } from "@/lib/db/store";
import type { TravelRadius } from "@/types";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const signupSchema = z.object({
  region_id: z.string().trim().min(1),
  full_name: z.string().trim().min(1, "Name is required"),
  emails: z.string().trim().min(1, "At least one email is required"),
  traded_before: z.enum(["yes", "no"], { message: "Please answer this question" }),
  home_city_state: z.string().trim().min(1, "Town and state are required"),
  home_store: z.string().trim().min(1, "This field is required"),
  travel_radius: z.enum(["25", "50", "100", "any"], { message: "Please choose a travel distance" }),
  desired_subregions: z.array(z.string()).default([]),
  desired_subregions_other: z.string().trim().optional(),
  requested_locations: z.string().trim().optional(),
});

export type SignupResult = { ok: boolean; message: string };

export async function submitReminderSignup(formData: FormData): Promise<SignupResult> {
  const parsed = signupSchema.safeParse({
    region_id: formData.get("region_id"),
    full_name: formData.get("full_name"),
    emails: formData.get("emails"),
    traded_before: formData.get("traded_before"),
    home_city_state: formData.get("home_city_state"),
    home_store: formData.get("home_store"),
    travel_radius: formData.get("travel_radius"),
    desired_subregions: formData.getAll("desired_subregions"),
    desired_subregions_other: formData.get("desired_subregions_other"),
    requested_locations: formData.get("requested_locations"),
  });

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues.map((i) => i.message).join(", ") };
  }

  const region = store.regions.find((r) => r.id === parsed.data.region_id);
  if (!region) {
    return { ok: false, message: "This signup form isn't available right now." };
  }

  const emails = Array.from(
    new Set(
      parsed.data.emails
        .split(/[,\n]/)
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean)
    )
  );

  if (emails.length === 0 || !emails.every((e) => EMAIL_RE.test(e))) {
    return { ok: false, message: "Enter one or more valid email addresses, separated by commas." };
  }

  const otherText = parsed.data.desired_subregions_other?.trim() || null;
  if (parsed.data.desired_subregions.length === 0 && !otherText) {
    return { ok: false, message: "Pick at least one area you'd like reminders for." };
  }

  const custom_answers: Record<string, string> = {};
  for (const q of region.signup_form.custom_questions) {
    const value = formData.get(`custom_${q.id}`);
    const trimmed = typeof value === "string" ? value.trim() : "";
    if (q.required && !trimmed) {
      return { ok: false, message: `Please answer: ${q.label}` };
    }
    if (trimmed) custom_answers[q.id] = trimmed;
  }

  store.reminderSignups.push({
    id: newId(),
    region_id: region.id,
    full_name: parsed.data.full_name,
    emails,
    traded_before: parsed.data.traded_before === "yes",
    home_city_state: parsed.data.home_city_state,
    home_store: parsed.data.home_store,
    travel_radius: parsed.data.travel_radius as TravelRadius,
    desired_subregions: parsed.data.desired_subregions,
    desired_subregions_other: otherText,
    requested_locations: parsed.data.requested_locations?.trim() || null,
    custom_answers,
    created_at: new Date().toISOString(),
  });

  return { ok: true, message: "You're signed up! We'll email you when we're heading your way." };
}
