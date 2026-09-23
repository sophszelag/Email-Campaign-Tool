import Link from "next/link";
import { headers } from "next/headers";
import { requireSession } from "@/lib/session";
import { store } from "@/lib/db/store";
import { formatEventDate } from "@/lib/events";
import AppShell from "@/components/AppShell";
import CopyLinkButton from "@/components/CopyLinkButton";

export const dynamic = "force-dynamic";

function daysAgoIso(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

export default async function DashboardPage() {
  const session = await requireSession();

  const hdrs = await headers();
  const origin = `${hdrs.get("x-forwarded-proto") ?? "https"}://${hdrs.get("host")}`;

  const today = new Date().toISOString().slice(0, 10);
  const sevenDaysAgo = daysAgoIso(7);

  const totalSignups = store.reminderSignups.length;
  const totalPreRegs = store.preRegistrations.length;
  const upcomingEvents = store.events
    .filter((e) => e.status === "upcoming" && e.start_date >= today)
    .sort((a, b) => a.start_date.localeCompare(b.start_date));
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

      <section className="mb-8 rounded-[10px] border bg-white shadow-sm">
        <div className="p-5 pb-0">
          <h2 className="text-sm font-bold text-turf-green-500">Your events · share to pre-register</h2>
        </div>

        {upcomingEvents.length === 0 && (
          <p className="p-5 text-sm text-slate-green-500">
            No upcoming events yet — add some on the{" "}
            <Link href="/events" className="font-bold text-turf-green-500 underline">
              Events
            </Link>{" "}
            page.
          </p>
        )}

        {upcomingEvents.map((event, index) => {
          const region = store.regions.find((r) => r.id === event.region_id);
          const registered = store.preRegistrations.filter((p) => p.event_id === event.id).length;
          const url = `${origin}/preregister/event/${event.id}`;
          const pct = event.capacity ? Math.min(100, Math.round((registered / event.capacity) * 100)) : null;

          return (
            <div key={event.id} className={`p-5 ${index > 0 ? "border-t" : ""}`}>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="font-bold text-turf-green-500">
                    {event.venue} · {event.city_state}
                  </div>
                  <div className="mt-0.5 text-sm text-slate-green-500">
                    {formatEventDate(event)}
                    {event.hours ? ` · ${event.hours}` : ""}
                    {region ? ` · ${region.name}` : ""}
                  </div>
                </div>
                <div className="flex flex-col items-start gap-2 sm:items-end">
                  <code className="max-w-[260px] truncate rounded-md bg-offwhite px-3 py-2 text-xs text-turf-green-500">
                    {url}
                  </code>
                  <CopyLinkButton text={url} />
                </div>
              </div>

              <div className="mt-4">
                {event.capacity ? (
                  <div className="flex items-center gap-3">
                    <div className="h-2 flex-1 rounded-full bg-pastel-green-500">
                      <div
                        className="h-2 rounded-full bg-green-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="whitespace-nowrap text-sm text-turf-green-500">
                      <strong>{registered.toLocaleString()}</strong>/{event.capacity.toLocaleString()}{" "}
                      registered
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-turf-green-500">
                    {registered.toLocaleString()} registered
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </section>

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
