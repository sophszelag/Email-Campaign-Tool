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

export type TeamEventsCsvParseResult = {
  /** Rows grouped by the region they matched, keyed by region id. */
  rowsByRegionId: Map<string, ParsedEventRow[]>;
  errors: string[];
};

type MatchableRegion = { id: string; name: string; slug: string; subregion_options: string[] };

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
  region: "region",
  market: "region",
  subregion: "subregion",
  "sub-region": "subregion",
  "sub region": "subregion",
  status: "status",
};

function normalizeHeader(header: string): string {
  const key = header.trim().toLowerCase();
  return HEADER_ALIASES[key] ?? key;
}

// For matching a spreadsheet's free-text region name against a real
// Region — case/punctuation-insensitive so "South NJ / Philadelphia" and
// "south-nj-philadelphia" both match without her needing to type it exactly.
function normalizeForMatch(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "");
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

type CommonFields = Omit<ParsedEventRow, "subregion">;

function parseCommonFields(
  record: Record<string, string>,
  rowNum: number
): { fields: CommonFields; rawSubregion: string | null } | { error: string } {
  const venue = record.venue?.trim();
  const cityState = record.city_state?.trim();
  const rawDate = record.start_date?.trim();

  if (!venue || !cityState || !rawDate) {
    return { error: `Row ${rowNum}: missing venue, city/location, or date — skipped.` };
  }

  const startDate = parseDateToIso(rawDate);
  if (!startDate) {
    return { error: `Row ${rowNum}: couldn't read the date "${rawDate}" — skipped.` };
  }

  const rawEndDate = record.end_date?.trim();
  const endDate = rawEndDate ? parseDateToIso(rawEndDate) : null;

  const rawStatus = record.status?.trim().toLowerCase();
  const status: EventStatus =
    rawStatus === "completed" || rawStatus === "cancelled" ? rawStatus : "upcoming";

  return {
    fields: {
      venue,
      city_state: cityState,
      start_date: startDate,
      end_date: endDate,
      hours: record.hours?.trim() || null,
      status,
    },
    rawSubregion: record.subregion?.trim() || null,
  };
}

function resolveSubregion(rawSubregion: string | null, subregionOptions: string[]): string | null {
  if (!rawSubregion) return null;
  return subregionOptions.find((o) => o.toLowerCase() === rawSubregion.toLowerCase()) ?? rawSubregion;
}

function parseRecords(csvText: string): { records: Record<string, string>[] } | { error: string } {
  try {
    const records: Record<string, string>[] = parse(csvText, {
      columns: (headerRow: string[]) => headerRow.map(normalizeHeader),
      skip_empty_lines: true,
      trim: true,
      relax_column_count: true,
    });
    return { records };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Couldn't read that file as a CSV." };
  }
}

/**
 * Parses a single region's weekly event-calendar CSV export. Required
 * columns (by any of the aliases above): venue, city/location, and a
 * date. Optional: end date, hours, sub-region, status.
 */
export function parseEventsCsv(csvText: string, subregionOptions: string[]): EventsCsvParseResult {
  const parsedFile = parseRecords(csvText);
  if ("error" in parsedFile) return { rows: [], errors: [parsedFile.error] };

  const rows: ParsedEventRow[] = [];
  const errors: string[] = [];

  parsedFile.records.forEach((record, index) => {
    const parsed = parseCommonFields(record, index + 2);
    if ("error" in parsed) {
      errors.push(parsed.error);
      return;
    }
    rows.push({ ...parsed.fields, subregion: resolveSubregion(parsed.rawSubregion, subregionOptions) });
  });

  return { rows, errors };
}

/**
 * Parses a team-wide weekly CSV covering every region at once, using a
 * required "region" column to route each row to the right region (matched
 * against that region's name or slug, ignoring case/punctuation). Rows
 * for an unrecognized region are skipped and reported as errors rather
 * than guessed at.
 */
export function parseTeamEventsCsv(
  csvText: string,
  regions: MatchableRegion[]
): TeamEventsCsvParseResult {
  const parsedFile = parseRecords(csvText);
  if ("error" in parsedFile) return { rowsByRegionId: new Map(), errors: [parsedFile.error] };

  const rowsByRegionId = new Map<string, ParsedEventRow[]>();
  const errors: string[] = [];

  parsedFile.records.forEach((record, index) => {
    const rowNum = index + 2;
    const rawRegion = record.region?.trim();
    if (!rawRegion) {
      errors.push(`Row ${rowNum}: missing region — skipped.`);
      return;
    }

    const normalizedRawRegion = normalizeForMatch(rawRegion);
    const region = regions.find(
      (r) => normalizeForMatch(r.name) === normalizedRawRegion || normalizeForMatch(r.slug) === normalizedRawRegion
    );
    if (!region) {
      errors.push(`Row ${rowNum}: unrecognized region "${rawRegion}" — skipped.`);
      return;
    }

    const parsed = parseCommonFields(record, rowNum);
    if ("error" in parsed) {
      errors.push(parsed.error);
      return;
    }

    const row: ParsedEventRow = {
      ...parsed.fields,
      subregion: resolveSubregion(parsed.rawSubregion, region.subregion_options),
    };

    const list = rowsByRegionId.get(region.id) ?? [];
    list.push(row);
    rowsByRegionId.set(region.id, list);
  });

  return { rowsByRegionId, errors };
}
