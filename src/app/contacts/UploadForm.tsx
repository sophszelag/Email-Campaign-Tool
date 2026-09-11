"use client";

import { useActionState } from "react";
import { uploadContactsCsv, type UploadResult } from "@/app/contacts/actions";

const initialState: UploadResult = { ok: false, message: "" };

async function action(_prevState: UploadResult, formData: FormData) {
  return uploadContactsCsv(formData);
}

export default function UploadForm() {
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="rounded-lg border bg-white p-6">
      <h2 className="text-sm font-semibold text-turf-green-500">Upload past customers</h2>
      <p className="mt-1 text-sm text-slate-green-500">
        CSV with columns: <code>first_name, email, payout_amount, city, state</code>. Re-uploading
        updates existing contacts by email instead of duplicating them.
      </p>
      <div className="mt-4 flex items-center gap-3">
        <input
          type="file"
          name="file"
          accept=".csv,text/csv"
          required
          className="text-sm text-slate-green-500"
        />
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-turf-green-500 px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
        >
          {isPending ? "Uploading…" : "Upload"}
        </button>
      </div>
      {state.message && (
        <p className={`mt-3 text-sm ${state.ok ? "text-green-500" : "text-red-500"}`}>
          {state.message}
          {state.ok && (state.skippedRows ?? 0) > 0 && (
            <> ({state.skippedRows} row{state.skippedRows === 1 ? "" : "s"} skipped — missing/invalid email.)</>
          )}
        </p>
      )}
    </form>
  );
}
