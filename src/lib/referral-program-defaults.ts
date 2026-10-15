import type { ReferralProgramSettings } from "@/types";

export function defaultReferralProgramSettings(): ReferralProgramSettings {
  return { per_referral_percent: 5, max_percent: 15 };
}
