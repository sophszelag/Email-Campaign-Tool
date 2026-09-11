import { parse } from "csv-parse/sync";
import { parseDollarsToCents } from "@/lib/money";

export type ParsedContact = {
  email: string;
  first_name: string | null;
  city: string | null;
  state: string | null;
  past_payout_amount_cents: number | null;
};

export type CsvParseResult = {
  contacts: ParsedContact[];
  skippedRows: number;
  duplicatesInFile: number;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Parses the customer CSV (first_name, email, payout_amount, city, state),
 * normalizing and deduplicating as it goes: lowercase + trim emails, drop
 * rows with no valid email, and keep the last occurrence of a repeated
 * email within the same file.
 */
export function parseContactsCsv(fileContents: string): CsvParseResult {
  const rows: Record<string, string>[] = parse(fileContents, {
    columns: (header: string[]) => header.map((h) => h.trim().toLowerCase()),
    skip_empty_lines: true,
    trim: true,
  });

  const byEmail = new Map<string, ParsedContact>();
  let skippedRows = 0;
  let duplicatesInFile = 0;

  for (const row of rows) {
    const email = (row.email ?? "").trim().toLowerCase();
    if (!EMAIL_RE.test(email)) {
      skippedRows += 1;
      continue;
    }

    if (byEmail.has(email)) {
      duplicatesInFile += 1;
    }

    byEmail.set(email, {
      email,
      first_name: (row.first_name ?? "").trim() || null,
      city: (row.city ?? "").trim() || null,
      state: (row.state ?? "").trim() || null,
      past_payout_amount_cents: parseDollarsToCents(row.payout_amount),
    });
  }

  return {
    contacts: Array.from(byEmail.values()),
    skippedRows,
    duplicatesInFile,
  };
}
