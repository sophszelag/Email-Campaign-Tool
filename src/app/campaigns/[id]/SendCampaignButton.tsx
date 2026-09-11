"use client";

import { useActionState, useState } from "react";
import { sendCampaign } from "@/app/campaigns/actions";

const initialState = { ok: false, message: "" };

export default function SendCampaignButton({
  campaignId,
  recipientCount,
}: {
  campaignId: string;
  recipientCount: number;
}) {
  const [confirming, setConfirming] = useState(false);
  const [state, formAction, isPending] = useActionState(
    async () => sendCampaign(campaignId),
    initialState
  );

  if (!confirming) {
    return (
      <button
        onClick={() => setConfirming(true)}
        disabled={recipientCount === 0}
        className="rounded-md bg-green-500 px-5 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
      >
        Send campaign to {recipientCount} recipient{recipientCount === 1 ? "" : "s"}
      </button>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-3 rounded-md border border-red-500/40 bg-red-500/5 p-4">
      <p className="text-sm font-medium text-turf-green-500">
        This will send a real email to {recipientCount} recipient{recipientCount === 1 ? "" : "s"}. Are you sure?
      </p>
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-red-500 px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
        >
          {isPending ? "Sending…" : "Yes, send it"}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="text-sm text-slate-green-500 underline"
        >
          Cancel
        </button>
      </div>
      {state.message && (
        <span className={`text-sm ${state.ok ? "text-green-500" : "text-red-500"}`}>{state.message}</span>
      )}
    </form>
  );
}
