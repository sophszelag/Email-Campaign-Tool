"use client";

import { useActionState } from "react";
import { uploadEventsCsv, type UploadEventsResult } from "./actions";

const initialState: UploadEventsResult = { ok: false, message: "" };

export default function UploadEventsForm({ regionId }: { regionId: string }) {
  const boundUpload = uploadEventsCsv.bind(null, regionId);
  const [state, formAction, isPending] = useActionState(boundUpload, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <div className="flex flex-col gap-1.5">
        <label className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-green-500">
          Weekly events CSV
        </label>
        <input
          type="file"
          name="csv_file"
          accept=".csv"
          required
          className="text-sm text-turf-green-500 file:mr-3 file:rounded-md file:border-0 file:bg-offwhite file:px-3 file:py-2 file:text-sm file:font-bold file:text-turf-green-500"
        />
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-turf-green-500 px-4 py-2 text-sm font-bold text-white hover:bg-[#18201D] disabled:opacity-50"
      >
        {isPending ? "Syncing…" : "Upload & sync"}
      </button>
      {state.message && (
        <p className={`text-sm sm:max-w-md ${state.ok ? "text-turf-green-500" : "text-red-500"}`}>
          {state.message}
        </p>
      )}
    </form>
  );
}
