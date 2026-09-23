"use client";

import { useActionState } from "react";
import { submitReminderSignup, type SignupResult } from "@/app/signup/[region]/actions";
import {
  FormSection,
  FormField,
  RadioCard,
  PortalCheckbox,
  PortalButton,
  SuccessState,
  CustomQuestionFields,
  portalInputClass,
} from "@/components/portal/PortalForm";
import { SIGNUP_FIELD_DEFAULTS, getFieldLabel } from "@/lib/form-defaults";
import type { CustomQuestion } from "@/types";

const initialState: SignupResult = { ok: false, message: "" };

export default function SignupForm({
  regionId,
  subregionOptions,
  fieldLabels,
  customQuestions,
}: {
  regionId: string;
  subregionOptions: string[];
  fieldLabels: Record<string, string>;
  customQuestions: CustomQuestion[];
}) {
  const [state, formAction, isPending] = useActionState(
    async (_prev: SignupResult, formData: FormData) => submitReminderSignup(formData),
    initialState
  );

  const label = (key: string) => getFieldLabel(SIGNUP_FIELD_DEFAULTS, fieldLabels, key);

  if (state.ok) {
    return <SuccessState title="You're signed up!" message={state.message} />;
  }

  return (
    <form action={formAction}>
      <input type="hidden" name="region_id" value={regionId} />

      <FormSection title="Contact information">
        <FormField label={label("full_name")} required>
          <input name="full_name" required className={portalInputClass} />
        </FormField>
        <FormField label={label("emails")} required>
          <textarea
            name="emails"
            required
            rows={2}
            placeholder="you@example.com, another@example.com"
            className={portalInputClass}
          />
        </FormField>
      </FormSection>

      <FormSection title="About you">
        <FormField label={label("traded_before")} required>
          <div className="flex flex-col gap-2.5">
            <RadioCard name="traded_before" value="yes" label="Yes" />
            <RadioCard name="traded_before" value="no" label="No" />
          </div>
        </FormField>
        <FormField label={label("home_city_state")} required>
          <input
            name="home_city_state"
            required
            placeholder="e.g. Cherry Hill, NJ"
            className={portalInputClass}
          />
        </FormField>
        <FormField label={label("home_store")} required>
          <textarea name="home_store" rows={2} required className={portalInputClass} />
        </FormField>
      </FormSection>

      <FormSection title="Where to remind you">
        <FormField label={label("travel_radius")} required>
          <div className="flex flex-col gap-2.5">
            <RadioCard name="travel_radius" value="25" label="Within 25 miles" />
            <RadioCard name="travel_radius" value="50" label="Within 50 miles" />
            <RadioCard name="travel_radius" value="100" label="Within 100 miles" />
            <RadioCard name="travel_radius" value="any" label="I will travel any distance for the right event" />
          </div>
        </FormField>

        <FormField label={label("desired_subregions")} required>
          <div className="flex flex-col">
            {subregionOptions.map((option) => (
              <PortalCheckbox key={option} name="desired_subregions" value={option} label={option} />
            ))}
            <div className="group/other">
              <PortalCheckbox label="Other:" />
              <div className="hidden pl-7 pt-2 group-has-[input:checked]/other:block">
                <input
                  name="desired_subregions_other"
                  placeholder="Where else?"
                  className={`${portalInputClass} w-full`}
                />
              </div>
            </div>
          </div>
        </FormField>

        <FormField label={label("requested_locations")}>
          <textarea name="requested_locations" rows={2} className={portalInputClass} />
        </FormField>
      </FormSection>

      <CustomQuestionFields questions={customQuestions} />

      {!state.ok && state.message && <p className="mb-4 text-sm text-portal-error">{state.message}</p>}

      <div className="flex">
        <PortalButton disabled={isPending}>{isPending ? "Submitting…" : "Sign me up"}</PortalButton>
      </div>
    </form>
  );
}
