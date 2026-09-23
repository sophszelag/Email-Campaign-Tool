import Link from "next/link";
import { requireSession } from "@/lib/session";
import { store } from "@/lib/db/store";
import AppShell from "@/components/AppShell";

export const dynamic = "force-dynamic";

function daysAgoIso(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

export default async function DashboardPage() {
  const session = await requireSession();

  const today = new Date().toISOString().slice(0, 10);
  const sevenDaysAgo = daysAgoIso(7);

  const totalSignups = store.reminderSignups.length;
  const totalPreRegs = store.preRegistrations.length;
  const upcomingEvents = store.events.filter((e) => e.status === "upcoming" && e.start_date >= today);
  const signupsLast7Days = store.reminderSignups.filter((s) => s.created_at >= sevenDaysAgo).length;
  const preRegsLast7Days = store.preRegistrations.filter((p) => p.created_at >= sevenDaysAgo).length;

  const regionStats = store.regions.map((region) => ({
    region,
    signups: store.reminderSignups.filter((s) => s.region_id === region.id).length,
    preRegs: store.preRegistrations.filter((p) => p.region_id === region.id).length,
    upcoming: store.events.filter(
      (e) => e.region_id === region.id && e.status === "upcoming" && e.start_date >= today
    ).length,
  }));

  return (
    <AppShell userEmail={session.user!.email!} title="Dashboard" subtitle="Across every region">
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Reminder signups" value={totalSignups} note={`+${signupsLast7Days} last 7 days`} />
        <StatCard label="Pre-registrations" value={totalPreRegs} note={`+${preRegsLast7Days} last 7 days`} />
        <StatCard label="Upcoming events" value={upcomingEvents.length} />
        <StatCard label="Regions" value={store.regions.length} />
      </div>

      <section>
        <h2 className="mb-3 text-sm font-bold text-turf-green-500">By region</h2>
        <div className="overflow-hidden overflow-x-auto rounded-[10px] border bg-white shadow-sm">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead>
              <tr className="bg-offwhite">
                <Th>Region</Th>
                <Th>Reminder signups</Th>
                <Th>Pre-registrations</Th>
                <Th>Upcoming events</Th>
                <Th>{""}</Th>
              </tr>
            </thead>
            <tbody>
              {regionStats.map(({ region, signups, preRegs, upcoming }) => (
                <tr key={region.id} className="border-b border-pastel-green-500 last:border-0">
                  <td className="px-4 py-3 font-medium text-turf-green-500">{region.name}</td>
                  <td className="px-4 py-3 text-turf-green-500">{signups.toLocaleString()}</td>
                  <td className="px-4 py-3 text-turf-green-500">{preRegs.toLocaleString()}</td>
                  <td className="px-4 py-3 text-turf-green-500">{upcoming.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/reminders/${region.slug}`}
                      className="rounded-md border px-3 py-1.5 text-xs font-bold text-turf-green-500 hover:bg-offwhite"
                    >
                      View responses
                    </Link>
                  </td>
                </tr>
              ))}
              {regionStats.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-slate-green-500">
                    No regions set up yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </AppShell>
  );
}

function StatCard({ label, value, note }: { label: string; value: number; note?: string }) {
  return (
    <div className="rounded-[10px] border bg-white p-5 shadow-sm">
      <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-slate-green-500">{label}</div>
      <div className="mt-2 text-3xl font-black text-turf-green-500">{value.toLocaleString()}</div>
      {note && <div className="mt-1 text-xs text-slate-green-500">{note}</div>}
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-[0.1em] text-slate-green-500">
      {children}
    </th>
  );
}
