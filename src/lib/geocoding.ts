export type Coordinates = { lat: number; lng: number };

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";

// Nominatim (OpenStreetMap) is free and needs no API key or account, but
// its usage policy requires a descriptive User-Agent identifying the
// application and a contact. See https://operations.osmfoundation.org/policies/nominatim/
const USER_AGENT = "SidelineSwap-TradeInEventTool/1.0 (contact: sophia.szelag@sidelineswap.com)";

/**
 * Looks up coordinates for a free-text address (e.g. "Cherry Hill, NJ").
 * Best-effort: a network hiccup, rate limit, or no match just returns
 * null rather than throwing, so a failed lookup degrades matching to the
 * area checklist instead of breaking the save that triggered it.
 */
export async function geocodeAddress(query: string): Promise<Coordinates | null> {
  const trimmed = query.trim();
  if (!trimmed) return null;

  try {
    const url = `${NOMINATIM_URL}?format=json&limit=1&q=${encodeURIComponent(trimmed)}`;
    const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
    if (!res.ok) return null;

    const results = (await res.json()) as Array<{ lat: string; lon: string }>;
    const first = results[0];
    if (!first) return null;

    const lat = Number.parseFloat(first.lat);
    const lng = Number.parseFloat(first.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

    return { lat, lng };
  } catch {
    return null;
  }
}

/**
 * Nominatim's usage policy caps requests at roughly one per second.
 * Call this between geocodeAddress() calls in a loop (CSV sync, bulk
 * backfills) — not needed for one-off calls from a single form submit.
 */
export function waitForNominatimRateLimit(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 1100));
}
