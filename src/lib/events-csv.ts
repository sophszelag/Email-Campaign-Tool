import { parse } from "csv-parse/sync";
import type { EventStatus } from "@/types";

export type ParsedEventRow = {
  venue: string;
  city_state: string;
  start_date: string;
  end_date: string | null;
  hours: string | null;
  subregion: string | null;
  status: EventStatus;
};

export type EventsCsvParseResult = {
  rows: ParsedEventRow[];
  errors: string[];
};

// The event ops manager's spreadsheet won't necessarily use these exact
// header names, so common variants are normalized to our field names
// rather than requiring her to rename columns every week.
const HEADER_ALIASES: Record<string, string> = {
  venue: "venue",
  location: "venue",
  store: "venue",
  city_state: "city_state",
  "city, state": "city_state",
  city: "city_state",
  start_date: "start_date",
  date: "start_date",
  event_date: "start_date",
  end_date: "end_date",
  hours: "hours",
  time: "hours",
  subregion: "subregion",
  "sub-region": "subregion",
  "sub region": "subregion",
  area: "subregion",
  status: "status",
};

function normalizeHeader(header: string): string {
  const key = header.trim().toLowerCase();
  return HEADER_ALIASES[key] ?? key;
}

// Accepts "2026-06-14" or "6/14/2026" (or 2-digit year); returns null if
// the date can't be read at all rather than guessing.
function parseDateToIso(raw: string): string | null {
  const trimmed = raw.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;

  const slash = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (slash) {
    const [, m, d, y] = slash;
    const year = y.length === 2 ? `20${y}` : y;
    return `${year}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }

  return null;
}

/**
 * Parses a weekly event-calendar CSV export into rows ready to sync into
 * a region's events. Required columns (by any of the aliases above):
 * venue, city/location, and a date. Optional: end date, hours, sub-region,
 * status.
 */
export function parseEventsCsv(csvText: string, subregionOptions: string[]): EventsCsvParseResult {
  let records: Record<string, string>[];
  try {
    records = parse(csvText, {
      columns: (headerRow: string[]) => headerRow.map(normalizeHeader),
      skip_empty_lines: true,
      trim: true,
      relax_column_count: true,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Couldn't read that file as a CSV.";
    return { rows: [], errors: [message] };
  }

  const rows: ParsedEventRow[] = [];
  const errors: string[] = [];

  records.forEach((record, index) => {
    const rowNum = index + 2; // header is row 1
    const venue = record.venue?.trim();
    const cityState = record.city_state?.trim();
    const rawDate = record.start_date?.trim();

    if (!venue || !cityState || !rawDate) {
      errors.push(`Row ${rowNum}: missing venue, city/location, or date — skipped.`);
      return;
    }

    const startDate = parseDateToIso(rawDate);
    if (!startDate) {
      errors.push(`Row ${rowNum}: couldn't read the date "${rawDate}" — skipped.`);
      return;
    }

    const rawEndDate = record.end_date?.trim();
    const endDate = rawEndDate ? parseDateToIso(rawEndDate) : null;

    const rawSubregion = record.subregion?.trim();
    const subregion = rawSubregion
      ? subregionOptions.find((o) => o.toLowerCase() === rawSubregion.toLowerCase()) ?? rawSubregion
      : null;

    const rawStatus = record.status?.trim().toLowerCase();
    const status: EventStatus =
      rawStatus === "completed" || rawStatus === "cancelled" ? rawStatus : "upcoming";

    rows.push({
      venue,
      city_state: cityState,
      start_date: startDate,
      end_date: endDate,
      hours: record.hours?.trim() || null,
      subregion,
      status,
    });
  });

  return { rows, errors };
}
