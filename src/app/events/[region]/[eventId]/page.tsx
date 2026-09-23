import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/session";
import { store } from "@/lib/db/store";
import AppShell from "@/components/AppShell";
import { updateEvent, deleteEvent } from "../actions";

export const dynamic = "force-dynamic";

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ region: string; eventId: string }>;
}) {
  const session = await requireSession();
  const { region: slug, eventId } = await params;

  const region = store.regions.find((r) => r.slug === slug);
  if (!region) notFound();

  const event = store.events.find((e) => e.id === eventId && e.region_id === region.id);
  if (!event) notFound();

  const boundUpdate = updateEvent.bind(null, region.id, event.id);
  const boundDelete = deleteEvent.bind(null, region.id, event.id);

  return (
    <AppShell userEmail={session.user!.email!} title="Edit event" subtitle={region.name}>
      <div className="mb-6">
        <Link
          href={`/events/${region.slug}`}
          className="text-[13px] font-medium text-slate-green-500 hover:text-turf-green-500"
        >
          ← Back to events
        </Link>
      </div>

      <section className="rounded-[10px] border bg-white p-5 shadow-sm">
        <form action={boundUpdate} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-green-500">
              Venue
            </label>
            <input
              name="venue"
              required
              defaultValue={event.venue}
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
              defaultValue={event.city_state}
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
              defaultValue={event.start_date}
              className="rounded-md border px-3 py-2 text-sm text-turf-green-500 focus:border-turf-green-500 focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-green-500">
              End date (optional)
            </label>
            <input
              type="date"
              name="end_date"
              defaultValue={event.end_date ?? ""}
              className="rounded-md border px-3 py-2 text-sm text-turf-green-500 focus:border-turf-green-500 focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-green-500">
              Hours (optional)
            </label>
            <input
              name="hours"
              defaultValue={event.hours ?? ""}
              className="rounded-md border px-3 py-2 text-sm text-turf-green-500 focus:border-turf-green-500 focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-green-500">
              Sub-region
            </label>
            <select
              name="subregion"
              defaultValue={event.subregion ?? ""}
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

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-green-500">
              Capacity (optional)
            </label>
            <input
              type="number"
              name="capacity"
              min={1}
              placeholder="e.g. 50"
              defaultValue={event.capacity ?? ""}
              className="rounded-md border px-3 py-2 text-sm text-turf-green-500 focus:border-turf-green-500 focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-green-500">
              Status
            </label>
            <select
              name="status"
              defaultValue={event.status}
              className="rounded-md border px-3 py-2 text-sm text-turf-green-500 focus:border-turf-green-500 focus:outline-none"
            >
              <option value="upcoming">Upcoming</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <button
              type="submit"
              className="rounded-md bg-turf-green-500 px-4 py-2 text-sm font-bold text-white hover:bg-[#18201D]"
            >
              Save changes
            </button>
          </div>
        </form>

        <form action={boundDelete} className="mt-4 border-t pt-4">
          <button
            type="submit"
            className="rounded-md border px-4 py-2 text-sm font-bold text-red-500 hover:bg-offwhite"
          >
            Delete event
          </button>
        </form>
      </section>
    </AppShell>
  );
}
