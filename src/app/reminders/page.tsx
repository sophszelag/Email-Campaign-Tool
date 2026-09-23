import Link from "next/link";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/session";
import { store } from "@/lib/db/store";
import AppShell from "@/components/AppShell";

export const dynamic = "force-dynamic";

export default async function RemindersIndexPage() {
  const session = await requireSession();

  // Today there's only one region, so skip straight to its dashboard. Once
  // more regions (and per-coordinator logins scoped to one region each)
  // exist, this index is what a manager sees across all of them.
  if (store.regions.length === 1) {
    redirect(`/reminders/${store.regions[0].slug}`);
  }

  return (
    <AppShell userEmail={session.user!.email!} title="Reminder signups" subtitle="Choose a region">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {store.regions.map((region) => {
          const count = store.reminderSignups.filter((s) => s.region_id === region.id).length;
          return (
            <Link
              key={region.id}
              href={`/reminders/${region.slug}`}
              className="rounded-[10px] border bg-white p-5 shadow-sm hover:border-green-500"
            >
              <div className="font-bold text-turf-green-500">{region.name}</div>
              <div className="mt-1 text-sm text-slate-green-500">
                {count.toLocaleString()} signup{count === 1 ? "" : "s"}
              </div>
            </Link>
          );
        })}
      </div>
    </AppShell>
  );
}
