import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/session";
import { store } from "@/lib/db/store";
import AppShell from "@/components/AppShell";
import UploadEventsForm from "./UploadEventsForm";

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

  const events = store.events
    .filter((e) => e.region_id === region.id)
    .sort((a, b) => a.start_date.localeCompare(b.start_date));

  return (
    <AppShell userEmail={session.user!.email!} title="Events" subtitle={region.name}>
      <div className="space-y-6">
        <section className="rounded-[10px] border bg-white p-5 shadow-sm">
          <h2 className="mb-1 text-sm font-bold text-turf-green-500">Upload this region&apos;s events CSV</h2>
          <p className="mb-4 text-[13px] text-slate-green-500">
            The calendar below syncs to whatever&apos;s in the file: rows are added or updated by
            matching venue + date, and any event no longer in the file is removed. Prefer to
            update every region in one file? Use the{" "}
            <Link href="/events" className="font-bold text-turf-green-500 underline">
              team-wide upload
            </Link>{" "}
            instead.
          </p>

          <UploadEventsForm regionId={region.id} />

          <p className="mt-4 text-xs text-slate-green-500">
            Expected columns (any order, common header variants like &ldquo;Location&rdquo; or
            &ldquo;Date&rdquo; are fine): <code className="rounded bg-offwhite px-1 py-0.5">venue</code>,{" "}
            <code className="rounded bg-offwhite px-1 py-0.5">city_state</code>,{" "}
            <code className="rounded bg-offwhite px-1 py-0.5">start_date</code>. Optional:{" "}
            <code className="rounded bg-offwhite px-1 py-0.5">end_date</code>,{" "}
            <code className="rounded bg-offwhite px-1 py-0.5">hours</code>,{" "}
            <code className="rounded bg-offwhite px-1 py-0.5">subregion</code>,{" "}
            <code className="rounded bg-offwhite px-1 py-0.5">status</code>,{" "}
            <code className="rounded bg-offwhite px-1 py-0.5">capacity</code>.
          </p>
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
                    No events yet — upload this week&apos;s CSV above.
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
