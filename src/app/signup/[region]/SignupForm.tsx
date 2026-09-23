"use client";

import { useActionState, useState } from "react";
import { submitReminderSignup, type SignupResult } from "@/app/signup/[region]/actions";

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
  const [showOther, setShowOther] = useState(false);

  if (state.ok) {
    return (
      <div className="rounded-lg bg-white p-8 text-center shadow-[0_4px_20px_rgba(37,60,50,0.08)]">
        <p className="text-lg font-bold text-[#253C32]">{state.message}</p>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      className="space-y-6 rounded-lg bg-white p-6 shadow-[0_4px_20px_rgba(37,60,50,0.08)] sm:p-8"
    >
      <input type="hidden" name="region_id" value={regionId} />

      <Field label="Full Name" required>
        <input name="full_name" required className={inputClass} />
      </Field>

      <Field label="Email Address (add multiple if desired)" required>
        <textarea
          name="emails"
          required
          rows={2}
          placeholder="you@example.com, another@example.com"
          className={inputClass}
        />
      </Field>

      <Field label="Have you traded in with us before?" required>
        <RadioGroup name="traded_before" options={[["yes", "Yes"], ["no", "No"]]} />
      </Field>

      <Field label="What town and state do you live in?" required>
        <input name="home_city_state" required placeholder="e.g. Cherry Hill, NJ" className={inputClass} />
      </Field>

      <Field label="How far are you willing to travel for a trade-in event?" required>
        <RadioGroup
          name="travel_radius"
          options={[
            ["25", "Within 25 miles"],
            ["50", "Within 50 miles"],
            ["100", "Within 100 miles"],
            ["any", "I will travel any distance for the right event"],
          ]}
        />
      </Field>

      <Field label='What is your "home" Dick&apos;s Store where you shop most?' required>
        <textarea name="home_store" rows={2} required className={inputClass} />
      </Field>

      <Field label="Desired Regions for Reminders" required>
        <div className="space-y-2">
          {subregionOptions.map((option) => (
            <label key={option} className="flex items-start gap-2 text-sm text-[#253C32]">
              <input type="checkbox" name="desired_subregions" value={option} className="mt-1" />
              {option}
            </label>
          ))}
          <label className="flex items-start gap-2 text-sm text-[#253C32]">
            <input
              type="checkbox"
              checked={showOther}
              onChange={(e) => setShowOther(e.target.checked)}
              className="mt-1"
            />
            Other:
          </label>
          {showOther && (
            <input
              name="desired_subregions_other"
              placeholder="Where else?"
              className={`${inputClass} ml-6 w-[calc(100%-1.5rem)]`}
            />
          )}
        </div>
      </Field>

      <Field label="Are there any locations not listed you would like us to host an event?">
        <textarea name="requested_locations" rows={2} className={inputClass} />
      </Field>

      {!state.ok && state.message && <p className="text-sm text-[#E84F4F]">{state.message}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-md bg-[#253C32] px-5 py-3 text-sm font-bold text-white hover:opacity-90 disabled:opacity-50"
      >
        {isPending ? "Submitting…" : "Sign me up"}
      </button>
    </form>
  );
}

const inputClass =
  "w-full rounded-md border border-[#CCDCD4] px-3 py-2 text-sm text-[#253C32] focus:border-[#02C874] focus:outline-none";

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-bold text-[#253C32]">
        {label} {required && <span className="text-[#E84F4F]">*</span>}
      </label>
      {children}
    </div>
  );
}

function RadioGroup({ name, options }: { name: string; options: [string, string][] }) {
  return (
    <div className="space-y-2">
      {options.map(([value, label]) => (
        <label key={value} className="flex items-center gap-2 text-sm text-[#253C32]">
          <input type="radio" name={name} value={value} required />
          {label}
        </label>
      ))}
    </div>
  );
}
