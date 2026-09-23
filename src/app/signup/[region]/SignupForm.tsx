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
  portalInputClass,
} from "@/components/portal/PortalForm";

const initialState: SignupResult = { ok: false, message: "" };

export default function SignupForm({
  regionId,
  subregionOptions,
}: {
  regionId: string;
  subregionOptions: string[];
}) {
  const [state, formAction, isPending] = useActionState(
    async (_prev: SignupResult, formData: FormData) => submitReminderSignup(formData),
    initialState
  );

  if (state.ok) {
    return <SuccessState title="You're signed up!" message={state.message} />;
  }

  return (
    <form action={formAction}>
      <input type="hidden" name="region_id" value={regionId} />

      <FormSection title="Contact information">
        <FormField label="Full Name" required>
          <input name="full_name" required className={portalInputClass} />
        </FormField>
        <FormField label="Email Address (add multiple if desired)" required>
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
        <FormField label="Have you traded in with us before?" required>
          <div className="flex flex-col gap-2.5">
            <RadioCard name="traded_before" value="yes" label="Yes" />
            <RadioCard name="traded_before" value="no" label="No" />
          </div>
        </FormField>
        <FormField label="What town and state do you live in?" required>
          <input
            name="home_city_state"
            required
            placeholder="e.g. Cherry Hill, NJ"
            className={portalInputClass}
          />
        </FormField>
        <FormField label='What is your "home" Dick&apos;s Store where you shop most?' required>
          <textarea name="home_store" rows={2} required className={portalInputClass} />
        </FormField>
      </FormSection>

      <FormSection title="Where to remind you">
        <FormField label="How far are you willing to travel for a trade-in event?" required>
          <div className="flex flex-col gap-2.5">
            <RadioCard name="travel_radius" value="25" label="Within 25 miles" />
            <RadioCard name="travel_radius" value="50" label="Within 50 miles" />
            <RadioCard name="travel_radius" value="100" label="Within 100 miles" />
            <RadioCard name="travel_radius" value="any" label="I will travel any distance for the right event" />
          </div>
        </FormField>

        <FormField label="Desired Regions for Reminders" required>
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

        <FormField label="Are there any locations not listed you would like us to host an event?">
          <textarea name="requested_locations" rows={2} className={portalInputClass} />
        </FormField>
      </FormSection>

      {!state.ok && state.message && <p className="mb-4 text-sm text-portal-error">{state.message}</p>}

      <div className="flex">
        <PortalButton disabled={isPending}>{isPending ? "Submitting…" : "Sign me up"}</PortalButton>
      </div>
    </form>
  );
}
