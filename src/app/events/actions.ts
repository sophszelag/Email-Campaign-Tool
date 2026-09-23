"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/session";
import { store } from "@/lib/db/store";
import { parseTeamEventsCsv } from "@/lib/events-csv";
import { syncRegionEvents } from "@/lib/events-sync";

export type UploadTeamEventsResult = { ok: boolean; message: string };

/**
 * The admin-facing, team-wide version of the per-region CSV upload: one
 * file, with a "region" column, updates every region's calendar in one
 * pass. Only regions that actually have rows in the file are touched —
 * a known region with zero rows is left alone rather than having its
 * whole calendar wiped, since that's more likely a gap in the export
 * than a real "drop everything" signal. Regions like that are called out
 * in the result so it's obvious when that assumption might be wrong.
 */
export async function uploadTeamEventsCsv(
  _prev: UploadTeamEventsResult,
  formData: FormData
): Promise<UploadTeamEventsResult> {
  await requireSession();

  const file = formData.get("csv_file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, message: "Choose a CSV file first." };
  }

  const text = await file.text();
  const { rowsByRegionId, errors } = parseTeamEventsCsv(text, store.regions);

  if (rowsByRegionId.size === 0) {
    return { ok: false, message: `No valid rows found in that file. ${errors.join(" ")}`.trim() };
  }

  const touchedSummaries: string[] = [];
  for (const [regionId, rows] of rowsByRegionId) {
    const region = store.regions.find((r) => r.id === regionId);
    if (!region) continue;

    const { added, updated, removed } = syncRegionEvents(regionId, rows);
    touchedSummaries.push(`${region.name}: ${added} added, ${updated} updated, ${removed} removed`);
    revalidatePath(`/events/${region.slug}`);
    revalidatePath(`/preregister/${region.slug}`);
  }
  revalidatePath("/events");

  const untouched = store.regions.filter((r) => !rowsByRegionId.has(r.id));
  const untouchedNote =
    untouched.length > 0
      ? ` No rows found for: ${untouched.map((r) => r.name).join(", ")} — left unchanged.`
      : "";
  const errorNote = errors.length > 0 ? ` ${errors.length} row(s) skipped — ${errors.join(" ")}` : "";

  return {
    ok: true,
    message: `Synced. ${touchedSummaries.join("; ")}.${untouchedNote}${errorNote}`,
  };
}
