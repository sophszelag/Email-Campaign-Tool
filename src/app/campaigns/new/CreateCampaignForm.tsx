"use client";

import { useActionState } from "react";
import RecipientsCheckboxList from "@/app/campaigns/RecipientsCheckboxList";
import FilterBar from "@/app/campaigns/new/FilterBar";
import { createCampaign } from "@/app/campaigns/actions";
import type { Contact } from "@/types";

type State = { ok: boolean; message: string };
const initialState: State = { ok: true, message: "" };

export default function CreateCampaignForm({
  contacts,
  totalMatches,
  recipientLimit,
  city,
  state,
}: {
  contacts: Contact[];
  totalMatches: number | null;
  recipientLimit: number;
  city?: string;
  state?: string;
}) {
  const [formState, formAction, isPending] = useActionState(async (_prev: State, formData: FormData) => {
    const result = await createCampaign(formData);
    // createCampaign redirects on success (which throws internally), so
    // reaching here means it returned — i.e. it failed.
    return result;
  }, initialState);

  return (
    <form action={formAction} className="mt-6 space-y-8">
      <section className="rounded-lg border bg-white p-6">
        <h2 className="text-sm font-semibold text-turf-green-500">Event details</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Campaign name" name="name" placeholder="e.g. MonkeySports Woodbridge — Oct 2026" full />
          <Field label="Venue" name="event_venue" placeholder="e.g. MonkeySports" />
          <Field label="City" name="event_city" placeholder="e.g. Woodbridge" />
          <Field label="State" name="event_state" placeholder="e.g. NJ" required={false} />
          <Field label="Dates" name="event_dates" placeholder="e.g. Oct 18–19, 2026" />
          <Field label="Hours" name="event_hours" placeholder="e.g. 10am–4pm" required={false} />
          <Field label="Bonus code" name="bonus_code" placeholder="e.g. WOODBRIDGE25" />
        </div>
      </section>

      <section className="rounded-lg border bg-white">
        <div className="border-b p-6">
          <h2 className="text-sm font-semibold text-turf-green-500">Recipients</h2>
          <p className="mt-1 text-sm text-slate-green-500">
            Filter by city/state, then check who should get this campaign. Unsubscribed contacts are
            excluded automatically.
            {typeof totalMatches === "number" && totalMatches > recipientLimit && (
              <> Showing the first {recipientLimit} of {totalMatches} matches — narrow the filter to see more.</>
            )}
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-3 border-b p-4">
          <FilterBar label="City" name="city" defaultValue={city} />
          <FilterBar label="State" name="state" defaultValue={state} />
        </div>
        <RecipientsCheckboxList contacts={contacts} />
      </section>

      {!formState.ok && formState.message && (
        <p className="text-sm text-red-500">{formState.message}</p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-turf-green-500 px-5 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
      >
        {isPending ? "Creating…" : "Create campaign (draft)"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  placeholder,
  full,
  required = true,
}: {
  label: string;
  name: string;
  placeholder?: string;
  full?: boolean;
  required?: boolean;
}) {
  return (
    <div className={full ? "sm:col-span-2" : undefined}>
      <label className="block text-xs text-slate-green-500">{label}</label>
      <input
        name={name}
        placeholder={placeholder}
        required={required}
        className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
      />
    </div>
  );
}
