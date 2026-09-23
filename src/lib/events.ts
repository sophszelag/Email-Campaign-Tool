import { store } from "@/lib/db/store";
import type { TradeInEvent } from "@/types";

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

/** The soonest upcoming event for a region, or null if none is scheduled. */
export function getNextUpcomingEvent(regionId: string): TradeInEvent | null {
  const today = todayIso();
  const upcoming = store.events
    .filter((e) => e.region_id === regionId && e.status === "upcoming" && e.start_date >= today)
    .sort((a, b) => a.start_date.localeCompare(b.start_date));

  return upcoming[0] ?? null;
}

export function formatEventDate(event: TradeInEvent): string {
  const start = new Date(`${event.start_date}T00:00:00`).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  if (!event.end_date || event.end_date === event.start_date) return start;

  const end = new Date(`${event.end_date}T00:00:00`).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return `${start} – ${end}`;
}
