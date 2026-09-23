"use client";

import { useActionState } from "react";
import { submitPreRegistration, type PreRegResult } from "@/app/preregister/[region]/actions";
import {
  FormSection,
  FormField,
  RadioCard,
  PortalButton,
  InfoBox,
  SuccessState,
  CustomQuestionFields,
  portalInputClass,
} from "@/components/portal/PortalForm";
import { PREREGISTER_FIELD_DEFAULTS, getFieldLabel } from "@/lib/form-defaults";
import type { CustomQuestion } from "@/types";

const initialState: PreRegResult = { ok: false, message: "" };

const SPORTS: [string, string][] = [
  ["baseball", "Baseball"],
  ["basketball", "Basketball"],
  ["football", "Football"],
  ["hockey", "Hockey"],
  ["lacrosse", "Lacrosse"],
  ["soccer", "Soccer"],
  ["softball", "Softball"],
  ["tennis", "Tennis"],
  ["other", "Other"],
];

const ITEM_COUNTS: [string, string][] = [
  ["1-3", "1–3 items"],
  ["4-7", "4–7 items"],
  ["8-12", "8–12 items"],
  ["13+", "13+ items"],
];

export default function PreRegistrationForm({
  regionId,
  fieldLabels,
  customQuestions,
}: {
  regionId: string;
  fieldLabels: Record<string, string>;
  customQuestions: CustomQuestion[];
}) {
  const [state, formAction, isPending] = useActionState(
    async (_prev: PreRegResult, formData: FormData) => submitPreRegistration(formData),
    initialState
  );

  const label = (key: string) => getFieldLabel(PREREGISTER_FIELD_DEFAULTS, fieldLabels, key);

  if (state.ok) {
    return (
      <SuccessState
        title="Registration complete!"
        message={`${state.message} Check your email and text messages for updates.`}
      />
    );
  }

  return (
    <form action={formAction}>
      <input type="hidden" name="region_id" value={regionId} />

      <FormSection title="Contact information">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <FormField label={label("first_name")} required>
            <input name="first_name" required placeholder="e.g. Parker" className={portalInputClass} />
          </FormField>
          <FormField label={label("last_name")} required>
            <input name="last_name" required placeholder="e.g. Swartz" className={portalInputClass} />
          </FormField>
        </div>
        <FormField label={label("email")} required>
          <input
            type="email"
            name="email"
            required
            placeholder="athlete@email.com"
            className={portalInputClass}
          />
        </FormField>
        <FormField label={label("phone")} required>
          <input type="tel" name="phone" required placeholder="(555) 123-4567" className={portalInputClass} />
        </FormField>
      </FormSection>

      <FormSection title="Gear information">
        <FormField label={label("sport")} required>
          <select name="sport" required defaultValue="" className={portalInputClass}>
            <option value="" disabled>
              Select a sport
            </option>
            {SPORTS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label={label("item_count")} required>
          <select name="item_count" required defaultValue="" className={portalInputClass}>
            <option value="" disabled>
              Select
            </option>
            {ITEM_COUNTS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </FormField>
      </FormSection>

      <FormSection title="Referral or promo">
        <div className="group/referral">
          <FormField label={label("has_referral_code")}>
            <div className="flex flex-col gap-2.5">
              <RadioCard name="has_referral_code" value="no" label="No, I don't have one" defaultChecked />
              <RadioCard name="has_referral_code" value="yes" label="Yes, I have a code" />
            </div>
          </FormField>

          <div className="mt-4 hidden space-y-4 group-has-[input[value=yes]:checked]/referral:block">
            <div className="rounded-lg border-[1.5px] border-[#cbecd6] bg-portal-green-tint p-3.5">
              <div className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-[#047a32]">
                💡 Tip
              </div>
              <p className="text-xs leading-relaxed text-[#3a6650]">
                Enter your referral or promo code below. Our team will verify and apply it to your payout.
              </p>
            </div>
            <FormField label="Code">
              <input name="referral_code" placeholder="e.g. FRIEND2024" className={portalInputClass} />
            </FormField>
          </div>
        </div>
      </FormSection>

      <CustomQuestionFields questions={customQuestions} />

      {!state.ok && state.message && <p className="mb-4 text-sm text-portal-error">{state.message}</p>}

      <div className="flex gap-3">
        <PortalButton variant="secondary" type="button">
          Cancel
        </PortalButton>
        <PortalButton disabled={isPending}>{isPending ? "Registering…" : "Register"}</PortalButton>
      </div>

      <InfoBox>
        Not sure about your item count? A rough guess is fine — our team will confirm everything when
        you arrive.
      </InfoBox>
    </form>
  );
}
