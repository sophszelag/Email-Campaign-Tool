"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/session";
import { store, newId } from "@/lib/db/store";
import type { EventStatus } from "@/types";

function readEventFields(formData: FormData) {
  const subregion = (formData.get("subregion") as string | null)?.trim() || null;
  const venue = (formData.get("venue") as string | null)?.trim() || "";
  const city_state = (formData.get("city_state") as string | null)?.trim() || "";
  const start_date = (formData.get("start_date") as string | null)?.trim() || "";
  const end_date = (formData.get("end_date") as string | null)?.trim() || null;
  const hours = (formData.get("hours") as string | null)?.trim() || null;
  return { subregion, venue, city_state, start_date, end_date, hours };
}

export async function addEvent(regionId: string, formData: FormData) {
  await requireSession();
  const region = store.regions.find((r) => r.id === regionId);
  if (!region) return;

  const fields = readEventFields(formData);
  if (!fields.venue || !fields.city_state || !fields.start_date) return;

  store.events.push({
    id: newId(),
    region_id: region.id,
    subregion: fields.subregion,
    venue: fields.venue,
    city_state: fields.city_state,
    start_date: fields.start_date,
    end_date: fields.end_date,
    hours: fields.hours,
    status: "upcoming",
    created_at: new Date().toISOString(),
  });

  revalidatePath(`/events/${region.slug}`);
}

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

  const status = formData.get("status");
  if (status === "upcoming" || status === "completed" || status === "cancelled") {
    event.status = status as EventStatus;
  }

  revalidatePath(`/events/${region.slug}`);
  revalidatePath(`/events/${region.slug}/${event.id}`);
}

export async function deleteEvent(regionId: string, eventId: string) {
  await requireSession();
  const region = store.regions.find((r) => r.id === regionId);
  if (!region) return;

  store.events = store.events.filter((e) => !(e.id === eventId && e.region_id === regionId));

  revalidatePath(`/events/${region.slug}`);
}
