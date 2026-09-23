import { notFound } from "next/navigation";
import { requireSession } from "@/lib/session";
import { store } from "@/lib/db/store";
import { formatEventDate } from "@/lib/events";
import AppShell from "@/components/AppShell";
import type { PreRegistration, TradeInEvent } from "@/types";

export const dynamic = "force-dynamic";

export default async function RegionRemindersPage({
  params,
}: {
  params: Promise<{ region: string }>;
}) {
  const session = await requireSession();
  const { region: slug } = await params;

  const region = store.regions.find((r) => r.slug === slug);
  if (!region) notFound();

  const signups = store.reminderSignups
    .filter((s) => s.region_id === region.id)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));

  const preRegistrations = store.preRegistrations
    .filter((p) => p.region_id === region.id)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));

  const events = store.events.filter((e) => e.region_id === region.id);
  const eventsById = new Map(events.map((e) => [e.id, e]));

  const preRegsByGroup = new Map<string, PreRegistration[]>();
  for (const p of preRegistrations) {
    const key = p.event_id && eventsById.has(p.event_id) ? p.event_id : "unassigned";
    const list = preRegsByGroup.get(key) ?? [];
    list.push(p);
    preRegsByGroup.set(key, list);
  }

  const orderedEventGroups = events
    .slice()
    .sort((a, b) => a.start_date.localeCompare(b.start_date))
    .map((e) => ({ event: e as TradeInEvent | null, registrations: preRegsByGroup.get(e.id) ?? [] }))
    .filter((g) => g.registrations.length > 0);

  const unassigned = preRegsByGroup.get("unassigned") ?? [];
  const preRegGroups = [
    ...orderedEventGroups,
    ...(unassigned.length > 0 ? [{ event: null, registrations: unassigned }] : []),
  ];

  const locationCounts = new Map<string, number>();
  for (const s of signups) {
    for (const loc of s.desired_subregions) {
      locationCounts.set(loc, (locationCounts.get(loc) ?? 0) + 1);
    }
  }
  const otherCount = signups.filter((s) => s.desired_subregions_other).length;

  return (
    <AppShell
      userEmail={session.user!.email!}
      title={region.name}
      subtitle={`${signups.length.toLocaleString()} reminder signups · ${preRegistrations.length.toLocaleString()} pre-registrations`}
    >
      <section className="mb-8">
        <h2 className="mb-3 text-sm font-bold text-turf-green-500">Reminder signups by location</h2>
        <div className="mb-6 overflow-hidden overflow-x-auto rounded-[10px] border bg-white shadow-sm">
          <table className="w-full min-w-[500px] text-left text-sm">
            <thead>
              <tr className="bg-offwhite">
                <Th>Location</Th>
                <Th>Signups</Th>
              </tr>
            </thead>
            <tbody>
              {region.subregion_options.map((loc) => (
                <tr key={loc} className="border-b border-pastel-green-500 last:border-0">
                  <td className="px-4 py-3 text-turf-green-500">{loc}</td>
                  <td className="px-4 py-3 font-medium text-turf-green-500">
                    {(locationCounts.get(loc) ?? 0).toLocaleString()}
                  </td>
                </tr>
              ))}
              {otherCount > 0 && (
                <tr className="border-b border-pastel-green-500 last:border-0">
                  <td className="px-4 py-3 text-turf-green-500">Other (typed in)</td>
                  <td className="px-4 py-3 font-medium text-turf-green-500">{otherCount.toLocaleString()}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <h2 className="mb-3 text-sm font-bold text-turf-green-500">Reminder signups</h2>
        <div className="overflow-hidden overflow-x-auto rounded-[10px] border bg-white shadow-sm">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr className="bg-offwhite">
                <Th>Name</Th>
                <Th>Email(s)</Th>
                <Th>Town/State</Th>
                <Th>Travel radius</Th>
                <Th>Desired areas</Th>
                <Th>Traded before</Th>
                <Th>Submitted</Th>
              </tr>
            </thead>
            <tbody>
              {signups.map((s) => (
                <tr key={s.id} className="border-b border-pastel-green-500 last:border-0 align-top">
                  <td className="px-4 py-3 font-medium text-turf-green-500">{s.full_name}</td>
                  <td className="px-4 py-3 text-turf-green-500">{s.emails.join(", ")}</td>
                  <td className="px-4 py-3 text-turf-green-500">{s.home_city_state}</td>
                  <td className="px-4 py-3 text-turf-green-500">
                    {s.travel_radius === "any" ? "Any distance" : `${s.travel_radius} mi`}
                  </td>
                  <td className="px-4 py-3 text-turf-green-500">
                    {[...s.desired_subregions, s.desired_subregions_other].filter(Boolean).join("; ") || "—"}
                  </td>
                  <td className="px-4 py-3 text-turf-green-500">{s.traded_before ? "Yes" : "No"}</td>
                  <td className="px-4 py-3 text-slate-green-500">
                    {new Date(s.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {signups.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-slate-green-500">
                    No signups yet — share the link above to start collecting them.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-bold text-turf-green-500">Pre-registrations by event</h2>

        {preRegGroups.length === 0 && (
          <div className="rounded-[10px] border bg-white p-5 text-sm text-slate-green-500 shadow-sm">
            No pre-registrations yet.
          </div>
        )}

        {preRegGroups.map(({ event, registrations }, index) => (
          <div key={event?.id ?? "unassigned"} className={index > 0 ? "mt-6" : ""}>
            <div className="mb-2 flex items-baseline justify-between">
              <h3 className="text-[13px] font-bold text-turf-green-500">
                {event ? `${event.venue} · ${event.city_state}` : "No event on file yet"}
              </h3>
              <span className="text-xs text-slate-green-500">
                {event ? formatEventDate(event) : "Registered before an event was scheduled"} ·{" "}
                {registrations.length.toLocaleString()} registration{registrations.length === 1 ? "" : "s"}
              </span>
            </div>
            <div className="overflow-hidden overflow-x-auto rounded-[10px] border bg-white shadow-sm">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead>
                  <tr className="bg-offwhite">
                    <Th>Name</Th>
                    <Th>Email</Th>
                    <Th>Phone</Th>
                    <Th>Sport</Th>
                    <Th>Items</Th>
                    <Th>Referral code</Th>
                    <Th>Submitted</Th>
                  </tr>
                </thead>
                <tbody>
                  {registrations.map((p) => (
                    <tr key={p.id} className="border-b border-pastel-green-500 last:border-0 align-top">
                      <td className="px-4 py-3 font-medium text-turf-green-500">
                        {p.first_name} {p.last_name}
                      </td>
                      <td className="px-4 py-3 text-turf-green-500">{p.email}</td>
                      <td className="px-4 py-3 text-turf-green-500">{p.phone}</td>
                      <td className="px-4 py-3 capitalize text-turf-green-500">{p.sports.join(", ")}</td>
                      <td className="px-4 py-3 text-turf-green-500">{p.item_count}</td>
                      <td className="px-4 py-3 text-turf-green-500">{p.referral_code ?? "—"}</td>
                      <td className="px-4 py-3 text-slate-green-500">
                        {new Date(p.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </section>
    </AppShell>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-[0.1em] text-slate-green-500">
      {children}
    </th>
  );
}
