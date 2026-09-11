"use client";

import { useActionState } from "react";
import { sendTestEmail } from "@/app/campaigns/actions";

const initialState = { ok: false, message: "" };

export default function SendTestButton({ campaignId }: { campaignId: string }) {
  const [state, formAction, isPending] = useActionState(
    async () => sendTestEmail(campaignId),
    initialState
  );

  return (
    <form action={formAction} className="flex items-center gap-3">
      <button
        type="submit"
        disabled={isPending}
        className="rounded-md border border-turf-green-500 px-4 py-2 text-sm font-medium text-turf-green-500 hover:bg-pastel-green-500/30 disabled:opacity-50"
      >
        {isPending ? "Sending…" : "Send test to myself"}
      </button>
      {state.message && (
        <span className={`text-sm ${state.ok ? "text-green-500" : "text-red-500"}`}>{state.message}</span>
      )}
    </form>
  );
}
