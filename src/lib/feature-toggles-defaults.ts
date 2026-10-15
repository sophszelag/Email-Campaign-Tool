import type { FeatureToggles } from "@/types";

export function defaultFeatureToggles(): FeatureToggles {
  return { reminder_signup: true, pre_registration: true, referral_program: true };
}
