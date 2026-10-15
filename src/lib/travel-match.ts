import type { ReminderSignup, TradeInEvent, TravelRadius } from "@/types";
import { distanceInMiles } from "./geo-distance";

const RADIUS_MILES: Record<Exclude<TravelRadius, "any">, number> = {
  "25": 25,
  "50": 50,
  "100": 100,
};

export type TravelMatch = {
  matches: boolean;
  /** Null when either side isn't geocoded yet — matched by area checklist instead. */
  distanceMiles: number | null;
  method: "distance" | "area";
};

/**
 * Whether a reminder signup should be reached out to for a given event.
 * A signup is a standing record, not tied to the event nearest when they
 * signed up — this is evaluated fresh against every event, past or
 * future, so the same signup keeps matching new events in their area
 * indefinitely.
 *
 * Prefers real driving distance when both the signup and the event are
 * geocoded; falls back to the desired-areas checklist when either side
 * has no coordinates yet (geocoding failed, rate-limited, or hasn't run).
 */
export function matchSignupToEvent(signup: ReminderSignup, event: TradeInEvent): TravelMatch {
  const bothGeocoded = signup.lat != null && signup.lng != null && event.lat != null && event.lng != null;

  if (bothGeocoded) {
    const distanceMiles = distanceInMiles(
      { lat: signup.lat!, lng: signup.lng! },
      { lat: event.lat!, lng: event.lng! }
    );
    const matches = signup.travel_radius === "any" || distanceMiles <= RADIUS_MILES[signup.travel_radius];
    return { matches, distanceMiles, method: "distance" };
  }

  if (signup.travel_radius === "any") {
    return { matches: true, distanceMiles: null, method: "area" };
  }

  const matches = Boolean(event.subregion && signup.desired_subregions.includes(event.subregion));
  return { matches, distanceMiles: null, method: "area" };
}
