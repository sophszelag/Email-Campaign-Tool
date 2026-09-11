"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/session";
import { parseContactsCsv } from "@/lib/csv";
import { store, newId } from "@/lib/db/store";

export type UploadResult = {
  ok: boolean;
  message: string;
  imported?: number;
  skippedRows?: number;
  duplicatesInFile?: number;
};

export async function uploadContactsCsv(formData: FormData): Promise<UploadResult> {
  await requireSession();

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, message: "Choose a CSV file first." };
  }

  const text = await file.text();
  const { contacts, skippedRows, duplicatesInFile } = parseContactsCsv(text);

  if (contacts.length === 0) {
    return { ok: false, message: "No valid rows found — check the file has an `email` column." };
  }

  // Upsert on email: re-uploading the same list updates city/state/payout
  // rather than creating duplicates.
  for (const parsed of contacts) {
    const existing = store.contacts.find((c) => c.email === parsed.email);
    if (existing) {
      existing.first_name = parsed.first_name;
      existing.city = parsed.city;
      existing.state = parsed.state;
      existing.past_payout_amount_cents = parsed.past_payout_amount_cents;
    } else {
      store.contacts.push({
        id: newId(),
        email: parsed.email,
        first_name: parsed.first_name,
        last_name: null,
        city: parsed.city,
        state: parsed.state,
        past_payout_amount_cents: parsed.past_payout_amount_cents,
        source: "csv",
        created_at: new Date().toISOString(),
      });
    }
  }

  revalidatePath("/contacts");

  return {
    ok: true,
    message: `Imported ${contacts.length} contact${contacts.length === 1 ? "" : "s"}.`,
    imported: contacts.length,
    skippedRows,
    duplicatesInFile,
  };
}
