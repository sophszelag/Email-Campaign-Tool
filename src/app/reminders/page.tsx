import { requireSession } from "@/lib/session";
import { store } from "@/lib/db/store";
import AppShell from "@/components/AppShell";

export const dynamic = "force-dynamic";

export default async function RemindersPage() {
  const session = await requireSession();

  const signups = [...store.reminderSignups].sort((a, b) => b.created_at.localeCompare(a.created_at));
  const regionsById = new Map(store.regions.map((r) => [r.id, r]));

  return (
    <AppShell
      userEmail={session.user!.email!}
      title="Reminder signups"
      subtitle={`${signups.length.toLocaleString()} people waiting to hear about an event near them`}
    >
      <div className="mb-6 rounded-[10px] border bg-white p-4 shadow-sm">
        <p className="text-sm text-slate-green-500">
          Public signup form{store.regions.length === 1 ? "" : "s"}:{" "}
          {store.regions.map((r, i) => (
            <span key={r.id}>
              {i > 0 && ", "}
              <code className="rounded bg-offwhite px-1.5 py-0.5 text-xs">/signup/{r.slug}</code> ({r.name})
            </span>
          ))}
        </p>
      </div>

      <div className="overflow-hidden overflow-x-auto rounded-[10px] border bg-white shadow-sm">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead>
            <tr className="bg-offwhite">
              <Th>Name</Th>
              <Th>Email(s)</Th>
              <Th>Region</Th>
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
                <td className="px-4 py-3 text-turf-green-500">{regionsById.get(s.region_id)?.name ?? "—"}</td>
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
                <td colSpan={8} className="px-4 py-10 text-center text-slate-green-500">
                  No signups yet — share the form link above to start collecting them.
                </td>
              </tr>
            )}
          </tbody>
        </table>
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
