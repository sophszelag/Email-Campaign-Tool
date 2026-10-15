import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/session";
import { store } from "@/lib/db/store";
import AppShell from "@/components/AppShell";
import { addSubregionOption, removeSubregionOption } from "../actions";

export const dynamic = "force-dynamic";

export default async function AreasSettingsPage({
  params,
}: {
  params: Promise<{ region: string }>;
}) {
  const session = await requireSession();
  const { region: slug } = await params;

  const region = store.regions.find((r) => r.slug === slug);
  if (!region) notFound();

  const boundAdd = addSubregionOption.bind(null, region.id);

  const eventCounts = new Map<string, number>();
  for (const event of store.events) {
    if (event.region_id === region.id && event.subregion) {
      eventCounts.set(event.subregion, (eventCounts.get(event.subregion) ?? 0) + 1);
    }
  }
  const signupCounts = new Map<string, number>();
  for (const signup of store.reminderSignups) {
    if (signup.region_id !== region.id) continue;
    for (const area of signup.desired_subregions) {
      signupCounts.set(area, (signupCounts.get(area) ?? 0) + 1);
    }
  }

  return (
    <AppShell userEmail={session.user!.email!} title="Settings" subtitle={region.name}>
      <div className="mb-6">
        <Link
          href={`/settings/${region.slug}`}
          className="text-[13px] font-medium text-slate-green-500 hover:text-turf-green-500"
        >
          ← Back to settings
        </Link>
      </div>

      <div className="mb-5 flex items-center gap-2">
        <span className="rounded-full bg-pastel-green-500 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.06em] text-turf-green-500">
          🗺️ Travel areas
        </span>
        <span className="text-[13px] text-slate-green-500">
          The &ldquo;desired areas&rdquo; list on the reminder signup form, and how events get tagged
        </span>
      </div>

      <section className="rounded-[10px] border bg-white p-5 shadow-sm">
        <h2 className="mb-1 text-sm font-bold text-turf-green-500">Areas</h2>
        <p className="mb-4 text-[13px] text-slate-green-500">
          Customers pick from this list when signing up for reminders, and events get tagged to one
          of these when added. Removing an area here doesn&apos;t change existing signups or events —
          it just stops offering it going forward.
        </p>

        {region.subregion_options.length > 0 && (
          <ul className="mb-5 divide-y">
            {region.subregion_options.map((option) => (
              <li key={option} className="flex items-center justify-between gap-3 py-3">
                <div>
                  <div className="text-sm font-medium text-turf-green-500">{option}</div>
                  <div className="text-xs text-slate-green-500">
                    {(eventCounts.get(option) ?? 0).toLocaleString()} event
                    {eventCounts.get(option) === 1 ? "" : "s"} ·{" "}
                    {(signupCounts.get(option) ?? 0).toLocaleString()} signup
                    {signupCounts.get(option) === 1 ? "" : "s"} currently tagged
                  </div>
                </div>
                <form action={removeSubregionOption.bind(null, region.id, option)}>
                  <button
                    type="submit"
                    className="rounded-md border px-3 py-1.5 text-xs font-bold text-red-500 hover:bg-offwhite"
                  >
                    Remove
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}

        {region.subregion_options.length === 0 && (
          <p className="mb-5 text-sm text-slate-green-500">No areas yet — add one below.</p>
        )}

        <form action={boundAdd} className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-end">
          <div className="flex flex-1 flex-col gap-1.5">
            <label className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-green-500">
              New area
            </label>
            <input
              name="label"
              required
              placeholder="e.g. Ocean County NJ (Dicks Toms River)"
              className="rounded-md border px-3 py-2 text-sm text-turf-green-500 focus:border-turf-green-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="rounded-md bg-turf-green-500 px-4 py-2 text-sm font-bold text-white hover:bg-[#18201D]"
          >
            Add area
          </button>
        </form>
      </section>
    </AppShell>
  );
}
