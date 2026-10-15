import {
  renderSignupConfirmationEmail,
  SIGNUP_CONFIRMATION_SAMPLE_MERGE_DATA,
  type SignupConfirmationMergeData,
} from "./templates/signup-confirmation";
import type { SignupConfirmationEmailSettings } from "@/types";

export type { SignupConfirmationMergeData };
export { SIGNUP_CONFIRMATION_SAMPLE_MERGE_DATA };

export function renderSignupConfirmationEmailHtml(
  content: SignupConfirmationEmailSettings,
  data: SignupConfirmationMergeData = SIGNUP_CONFIRMATION_SAMPLE_MERGE_DATA
): string {
  return renderSignupConfirmationEmail(content, data);
}
