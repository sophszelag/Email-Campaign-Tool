"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/session";
import { store } from "@/lib/db/store";
import { parseEventsCsv } from "@/lib/events-csv";
import { syncRegionEvents } from "@/lib/events-sync";
import type { EventStatus } from "@/types";

export type UploadEventsResult = { ok: boolean; message: string };

/**
 * The primary way events get into a region's calendar: sync the whole
 * list to match a weekly CSV export. Matches existing events to rows by
 * (venue, start date) so an event that persists week to week keeps its
 * id (any pre-registration linked to it stays linked) — a matched event
 * is updated in place, a new row becomes a new event, and any existing
 * event with no matching row is removed, since dropping it from the
 * spreadsheet means it's off the calendar.
 */
export async function uploadEventsCsv(
  regionId: string,
  _prev: UploadEventsResult,
  formData: FormData
): Promise<UploadEventsResult> {
  await requireSession();
  const region = store.regions.find((r) => r.id === regionId);
  if (!region) return { ok: false, message: "Region not found." };

  const file = formData.get("csv_file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, message: "Choose a CSV file first." };
  }

  const text = await file.text();
  const { rows, errors } = parseEventsCsv(text, region.subregion_options);

  if (rows.length === 0) {
    return { ok: false, message: `No valid rows found in that file. ${errors.join(" ")}`.trim() };
  }

  const { added, updated, removed } = syncRegionEvents(region.id, rows);

  revalidatePath(`/events/${region.slug}`);
  revalidatePath(`/preregister/${region.slug}`);

  const summary = `Synced: ${added} added, ${updated} updated, ${removed} removed.`;
  const errorNote = errors.length > 0 ? ` ${errors.length} row(s) skipped — ${errors.join(" ")}` : "";

  return { ok: true, message: summary + errorNote };
}

function readEventFields(formData: FormData) {
  const subregion = (formData.get("subregion") as string | null)?.trim() || null;
  const venue = (formData.get("venue") as string | null)?.trim() || "";
  const city_state = (formData.get("city_state") as string | null)?.trim() || "";
  const start_date = (formData.get("start_date") as string | null)?.trim() || "";
  const end_date = (formData.get("end_date") as string | null)?.trim() || null;
  const hours = (formData.get("hours") as string | null)?.trim() || null;
  const rawCapacity = (formData.get("capacity") as string | null)?.trim();
  const parsedCapacity = rawCapacity ? Number.parseInt(rawCapacity, 10) : NaN;
  const capacity = Number.isFinite(parsedCapacity) && parsedCapacity > 0 ? parsedCapacity : null;
  return { subregion, venue, city_state, start_date, end_date, hours, capacity };
}

/** For one-off corrections between weekly uploads — the CSV upload is the primary way events get added. */
export async function updateEvent(regionId: string, eventId: string, formData: FormData) {
  await requireSession();
  const region = store.regions.find((r) => r.id === regionId);
  const event = store.events.find((e) => e.id === eventId && e.region_id === regionId);
  if (!region || !event) return;

  const fields = readEventFields(formData);
  if (fields.venue) event.venue = fields.venue;
  if (fields.city_state) event.city_state = fields.city_state;
  if (fields.start_date) event.start_date = fields.start_date;
  event.end_date = fields.end_date;
  event.hours = fields.hours;
  event.subregion = fields.subregion;
  event.capacity = fields.capacity;

  const status = formData.get("status");
  if (status === "upcoming" || status === "completed" || status === "cancelled") {
    event.status = status as EventStatus;
  }

  revalidatePath(`/events/${region.slug}`);
  revalidatePath(`/events/${region.slug}/${event.id}`);
  revalidatePath(`/preregister/${region.slug}`);
}

export async function deleteEvent(regionId: string, eventId: string) {
  await requireSession();
  const region = store.regions.find((r) => r.id === regionId);
  if (!region) return;

  store.events = store.events.filter((e) => !(e.id === eventId && e.region_id === regionId));

  revalidatePath(`/events/${region.slug}`);
  revalidatePath(`/preregister/${region.slug}`);
}
