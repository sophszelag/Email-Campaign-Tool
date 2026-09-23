import { store, newId } from "@/lib/db/store";
import type { TradeInEvent } from "@/types";
import type { ParsedEventRow } from "@/lib/events-csv";

export type SyncSummary = { added: number; updated: number; removed: number };

/**
 * Syncs one region's events to match a parsed CSV's rows for that
 * region: matches existing events to rows by (venue, start date) so an
 * event that persists week to week keeps its id — a pre-registration
 * linked to it stays linked — updates matched events in place, adds new
 * rows as new events, and removes any existing event with no matching
 * row (dropped from the spreadsheet means it's off the calendar).
 */
export function syncRegionEvents(regionId: string, rows: ParsedEventRow[]): SyncSummary {
  const existing = store.events.filter((e) => e.region_id === regionId);
  const existingByKey = new Map(existing.map((e) => [`${e.venue.trim().toLowerCase()}|${e.start_date}`, e]));
  const seenIds = new Set<string>();
  const synced: TradeInEvent[] = [];
  let added = 0;
  let updated = 0;

  for (const row of rows) {
    const key = `${row.venue.trim().toLowerCase()}|${row.start_date}`;
    const match = existingByKey.get(key);

    if (match) {
      match.city_state = row.city_state;
      match.end_date = row.end_date;
      match.hours = row.hours;
      match.subregion = row.subregion;
      match.status = row.status;
      match.capacity = row.capacity;
      synced.push(match);
      seenIds.add(match.id);
      updated++;
    } else {
      const created: TradeInEvent = {
        id: newId(),
        region_id: regionId,
        venue: row.venue,
        city_state: row.city_state,
        start_date: row.start_date,
        end_date: row.end_date,
        hours: row.hours,
        subregion: row.subregion,
        status: row.status,
        capacity: row.capacity,
        email: null,
        created_at: new Date().toISOString(),
      };
      synced.push(created);
      seenIds.add(created.id);
      added++;
    }
  }

  const removed = existing.filter((e) => !seenIds.has(e.id)).length;

  store.events = [...store.events.filter((e) => e.region_id !== regionId), ...synced];

  return { added, updated, removed };
}
