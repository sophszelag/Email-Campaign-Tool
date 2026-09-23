import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/session";
import { store } from "@/lib/db/store";
import AppShell from "@/components/AppShell";
import { addEvent } from "./actions";

export const dynamic = "force-dynamic";

const STATUS_STYLES: Record<string, string> = {
  upcoming: "bg-green-100 text-green-700",
  completed: "bg-offwhite text-slate-green-500",
  cancelled: "bg-red-100 text-red-500",
};

export default async function RegionEventsPage({
  params,
}: {
  params: Promise<{ region: string }>;
}) {
  const session = await requireSession();
  const { region: slug } = await params;

  const region = store.regions.find((r) => r.slug === slug);
  if (!region) notFound();

  const boundAdd = addEvent.bind(null, region.id);

  const events = store.events
    .filter((e) => e.region_id === region.id)
    .sort((a, b) => a.start_date.localeCompare(b.start_date));

  return (
    <AppShell userEmail={session.user!.email!} title="Events" subtitle={region.name}>
      <div className="space-y-6">
        <section className="rounded-[10px] border bg-white p-5 shadow-sm">
          <h2 className="mb-1 text-sm font-bold text-turf-green-500">Add an event</h2>
          <p className="mb-4 text-[13px] text-slate-green-500">
            Once added, edit or cancel it any time — no need to re-upload anything when a date
            changes.
          </p>

          <form action={boundAdd} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-green-500">
                Venue
              </label>
              <input
                name="venue"
                required
                placeholder="e.g. Dick's Sporting Goods – Cherry Hill"
                className="rounded-md border px-3 py-2 text-sm text-turf-green-500 focus:border-turf-green-500 focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-green-500">
                City, state
              </label>
              <input
                name="city_state"
                required
                placeholder="e.g. Cherry Hill, NJ"
                className="rounded-md border px-3 py-2 text-sm text-turf-green-500 focus:border-turf-green-500 focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-green-500">
                Start date
              </label>
              <input
                type="date"
                name="start_date"
                required
                className="rounded-md border px-3 py-2 text-sm text-turf-green-500 focus:border-turf-green-500 focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-green-500">
                End date (optional, multi-day events)
              </label>
              <input
                type="date"
                name="end_date"
                className="rounded-md border px-3 py-2 text-sm text-turf-green-500 focus:border-turf-green-500 focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-green-500">
                Hours (optional)
              </label>
              <input
                name="hours"
                placeholder="e.g. 10am–4pm"
                className="rounded-md border px-3 py-2 text-sm text-turf-green-500 focus:border-turf-green-500 focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-green-500">
                Sub-region (optional)
              </label>
              <select
                name="subregion"
                defaultValue=""
                className="rounded-md border px-3 py-2 text-sm text-turf-green-500 focus:border-turf-green-500 focus:outline-none"
              >
                <option value="">Not tied to a specific area</option>
                {region.subregion_options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <button
                type="submit"
                className="rounded-md bg-turf-green-500 px-4 py-2 text-sm font-bold text-white hover:bg-[#18201D]"
              >
                Add event
              </button>
            </div>
          </form>
        </section>

        <section className="overflow-hidden overflow-x-auto rounded-[10px] border bg-white shadow-sm">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead>
              <tr className="bg-offwhite">
                <Th>Venue</Th>
                <Th>City, state</Th>
                <Th>Date</Th>
                <Th>Hours</Th>
                <Th>Sub-region</Th>
                <Th>Status</Th>
                <Th>{""}</Th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.id} className="border-b border-pastel-green-500 last:border-0 align-top">
                  <td className="px-4 py-3 font-medium text-turf-green-500">{event.venue}</td>
                  <td className="px-4 py-3 text-turf-green-500">{event.city_state}</td>
                  <td className="px-4 py-3 text-turf-green-500">
                    {event.start_date}
                    {event.end_date && event.end_date !== event.start_date ? ` – ${event.end_date}` : ""}
                  </td>
                  <td className="px-4 py-3 text-turf-green-500">{event.hours ?? "—"}</td>
                  <td className="px-4 py-3 text-turf-green-500">{event.subregion ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.04em] ${STATUS_STYLES[event.status]}`}
                    >
                      {event.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/events/${region.slug}/${event.id}`}
                      className="rounded-md border px-3 py-1.5 text-xs font-bold text-turf-green-500 hover:bg-offwhite"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
              {events.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-slate-green-500">
                    No events yet — add one above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      </div>
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
