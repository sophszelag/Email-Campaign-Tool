import Link from "next/link";
import { requireSession } from "@/lib/session";
import { store } from "@/lib/db/store";
import AppShell from "@/components/AppShell";
import UploadTeamEventsForm from "./UploadTeamEventsForm";

export const dynamic = "force-dynamic";

export default async function EventsIndexPage() {
  const session = await requireSession();

  return (
    <AppShell userEmail={session.user!.email!} title="Events" subtitle="Every region's calendar">
      <div className="space-y-6">
        <section className="rounded-[10px] border bg-white p-5 shadow-sm">
          <h2 className="mb-1 text-sm font-bold text-turf-green-500">Upload team-wide events CSV</h2>
          <p className="mb-4 text-[13px] text-slate-green-500">
            One file, every region: each row&apos;s <code className="rounded bg-offwhite px-1 py-0.5">region</code>{" "}
            column routes it to the right region&apos;s calendar (matched by region name, so
            &ldquo;South NJ / Philadelphia&rdquo; or its slug both work). A region with no rows in
            the file is left alone rather than cleared out — the result below calls out any region
            that happened.
          </p>

          <UploadTeamEventsForm />

          <p className="mt-4 text-xs text-slate-green-500">
            Expected columns (any order, common header variants are fine):{" "}
            <code className="rounded bg-offwhite px-1 py-0.5">region</code>,{" "}
            <code className="rounded bg-offwhite px-1 py-0.5">venue</code>,{" "}
            <code className="rounded bg-offwhite px-1 py-0.5">city_state</code>,{" "}
            <code className="rounded bg-offwhite px-1 py-0.5">start_date</code>. Optional:{" "}
            <code className="rounded bg-offwhite px-1 py-0.5">end_date</code>,{" "}
            <code className="rounded bg-offwhite px-1 py-0.5">hours</code>,{" "}
            <code className="rounded bg-offwhite px-1 py-0.5">subregion</code>,{" "}
            <code className="rounded bg-offwhite px-1 py-0.5">status</code>.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-bold text-turf-green-500">By region</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {store.regions.map((region) => {
              const count = store.events.filter((e) => e.region_id === region.id).length;
              return (
                <Link
                  key={region.id}
                  href={`/events/${region.slug}`}
                  className="rounded-[10px] border bg-white p-5 shadow-sm hover:border-green-500"
                >
                  <div className="font-bold text-turf-green-500">{region.name}</div>
                  <div className="mt-1 text-sm text-slate-green-500">
                    {count.toLocaleString()} event{count === 1 ? "" : "s"}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
