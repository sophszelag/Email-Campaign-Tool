// Payout amounts are stored as integer cents and displayed as whole-dollar
// currency (e.g. 48700 -> "$487"), per the project brief.
export function formatCentsAsWholeDollars(cents: number | null | undefined): string {
  if (cents === null || cents === undefined || Number.isNaN(cents)) {
    return "$0";
  }
  const dollars = Math.round(cents / 100);
  return `$${dollars.toLocaleString("en-US")}`;
}

// Parses a messy CSV cell like " $1,234.50 " into integer cents (123450).
export function parseDollarsToCents(raw: string | null | undefined): number | null {
  if (!raw) return null;
  const cleaned = raw.replace(/[^0-9.-]/g, "").trim();
  if (cleaned === "") return null;
  const dollars = Number.parseFloat(cleaned);
  if (Number.isNaN(dollars)) return null;
  return Math.round(dollars * 100);
}
