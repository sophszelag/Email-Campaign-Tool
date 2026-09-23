"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/session";
import { store, newId } from "@/lib/db/store";
import { SIGNUP_FIELD_DEFAULTS, PREREGISTER_FIELD_DEFAULTS } from "@/lib/form-defaults";
import type { FormCustomization, Region } from "@/types";

export type FormKind = "signup" | "preregister";

function getCustomization(region: Region, kind: FormKind): FormCustomization {
  return kind === "signup" ? region.signup_form : region.preregister_form;
}

function getDefaults(kind: FormKind): Record<string, string> {
  return kind === "signup" ? SIGNUP_FIELD_DEFAULTS : PREREGISTER_FIELD_DEFAULTS;
}

export async function updateFieldLabels(regionId: string, kind: FormKind, formData: FormData) {
  await requireSession();
  const region = store.regions.find((r) => r.id === regionId);
  if (!region) return;

  const target = getCustomization(region, kind);
  const defaults = getDefaults(kind);

  for (const key of Object.keys(defaults)) {
    const value = formData.get(`label_${key}`);
    const trimmed = typeof value === "string" ? value.trim() : "";
    if (trimmed && trimmed !== defaults[key]) {
      target.field_labels[key] = trimmed;
    } else {
      delete target.field_labels[key];
    }
  }

  revalidatePath(`/forms/${region.slug}/edit/${kind}`);
}

export async function addCustomQuestion(regionId: string, kind: FormKind, formData: FormData) {
  await requireSession();
  const region = store.regions.find((r) => r.id === regionId);
  if (!region) return;

  const label = (formData.get("label") as string | null)?.trim();
  if (!label) return;
  const required = formData.get("required") === "on";

  const target = getCustomization(region, kind);
  target.custom_questions.push({ id: newId(), label, required });

  revalidatePath(`/forms/${region.slug}/edit/${kind}`);
}

export async function removeCustomQuestion(
  regionId: string,
  kind: FormKind,
  questionId: string
) {
  await requireSession();
  const region = store.regions.find((r) => r.id === regionId);
  if (!region) return;

  const target = getCustomization(region, kind);
  target.custom_questions = target.custom_questions.filter((q) => q.id !== questionId);

  revalidatePath(`/forms/${region.slug}/edit/${kind}`);
}
