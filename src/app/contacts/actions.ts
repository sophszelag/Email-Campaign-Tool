"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/session";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { parseContactsCsv } from "@/lib/csv";

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

  const supabase = getSupabaseServerClient();

  // Upsert on email: re-uploading the same list updates city/state/payout
  // rather than creating duplicates.
  const { error } = await supabase.from("contacts").upsert(
    contacts.map((c) => ({ ...c, source: "csv" })),
    { onConflict: "email" }
  );

  if (error) {
    return { ok: false, message: `Database error: ${error.message}` };
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
