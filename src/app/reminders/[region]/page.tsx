import { notFound } from "next/navigation";
import { requireSession } from "@/lib/session";
import { store } from "@/lib/db/store";
import AppShell from "@/components/AppShell";

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

  return (
    <AppShell
      userEmail={session.user!.email!}
      title={region.name}
      subtitle={`${signups.length.toLocaleString()} reminder signups · ${preRegistrations.length.toLocaleString()} pre-registrations`}
    >
      <section className="mb-8">
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
        <h2 className="mb-3 text-sm font-bold text-turf-green-500">Trade-in pre-registrations</h2>
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
              {preRegistrations.map((p) => (
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
              {preRegistrations.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-slate-green-500">
                    No pre-registrations yet.
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

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-[0.1em] text-slate-green-500">
      {children}
    </th>
  );
}
