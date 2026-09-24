"use client";

import { useActionState } from "react";
import { submitPreRegistration, type PreRegResult } from "@/app/preregister/[region]/actions";
import {
  FormSection,
  FormField,
  PortalCheckbox,
  PortalButton,
  InfoBox,
  SuccessState,
  CustomQuestionFields,
  portalInputClass,
} from "@/components/portal/PortalForm";
import CopyLinkButton from "@/components/CopyLinkButton";
import { PREREGISTER_FIELD_DEFAULTS, getFieldLabel } from "@/lib/form-defaults";
import type { CustomQuestion } from "@/types";
import { REFERRAL_BONUS_PER_REFERRAL_PERCENT, REFERRAL_BONUS_MAX_PERCENT } from "@/types";

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
  eventId,
  referredBy,
  fieldLabels,
  customQuestions,
}: {
  regionId: string;
  eventId: string | null;
  referredBy?: string | null;
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
        note={
          state.referralLink ? (
            <div className="mt-6 rounded-lg border-[1.5px] border-[#cbecd6] bg-portal-green-tint p-4 text-left">
              <div className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-[#047a32]">
                💰 Earn a trade-in bonus
              </div>
              <p className="mb-3 text-xs leading-relaxed text-[#3a6650]">
                Share your link with friends and teammates — for every friend who pre-registers
                using it, you get a {REFERRAL_BONUS_PER_REFERRAL_PERCENT}% bonus on your trade-in,
                up to {REFERRAL_BONUS_MAX_PERCENT}%.
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <code className="max-w-full flex-1 truncate rounded-md bg-white px-3 py-2 text-xs text-portal-ink">
                  {state.referralLink}
                </code>
                <CopyLinkButton text={state.referralLink} />
              </div>
            </div>
          ) : undefined
        }
      />
    );
  }

  return (
    <form action={formAction}>
      <input type="hidden" name="region_id" value={regionId} />
      {eventId && <input type="hidden" name="event_id" value={eventId} />}
      {referredBy && <input type="hidden" name="referred_by" value={referredBy} />}

      <div className="mb-6 rounded-lg border-[1.5px] border-[#cbecd6] bg-portal-green-tint p-4">
        <div className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-[#047a32]">
          💰 Refer friends, earn a bonus
        </div>
        <p className="text-xs leading-relaxed text-[#3a6650]">
          Once you register, you&apos;ll get your own unique link to share with friends and
          teammates. For every friend who pre-registers using it, you earn a{" "}
          {REFERRAL_BONUS_PER_REFERRAL_PERCENT}% bonus on your trade-in — up to{" "}
          {REFERRAL_BONUS_MAX_PERCENT}%.
        </p>
      </div>

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
          <div className="flex flex-col">
            {SPORTS.map(([value, sportLabel]) => (
              <PortalCheckbox key={value} name="sport" value={value} label={sportLabel} />
            ))}
          </div>
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
