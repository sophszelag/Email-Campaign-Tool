import { requireSession } from "@/lib/session";
import { store } from "@/lib/db/store";
import { formatCentsAsWholeDollars } from "@/lib/money";
import AppShell from "@/components/AppShell";
import UploadForm from "@/app/contacts/UploadForm";

export const dynamic = "force-dynamic";

export default async function ContactsPage({
  searchParams,
}: {
  searchParams: Promise<{ city?: string; state?: string }>;
}) {
  const session = await requireSession();
  const { city, state } = await searchParams;

  const totalCount = store.contacts.length;

  let contacts = [...store.contacts].sort((a, b) => b.created_at.localeCompare(a.created_at));
  if (city) contacts = contacts.filter((c) => c.city?.toLowerCase().includes(city.toLowerCase()));
  if (state) contacts = contacts.filter((c) => c.state?.toLowerCase().includes(state.toLowerCase()));
  contacts = contacts.slice(0, 200);

  return (
    <AppShell
      userEmail={session.user!.email!}
      title="Contacts"
      subtitle={`${totalCount.toLocaleString()} past customers on file`}
    >
      <UploadForm />

      <div className="mt-8 overflow-hidden rounded-[10px] border bg-white shadow-sm">
        <form className="flex flex-wrap items-end gap-3 border-b p-4">
          <div>
            <label className="block text-xs text-slate-green-500">City</label>
            <input
              name="city"
              defaultValue={city}
              className="mt-1 rounded-md border px-2 py-1 text-sm"
              placeholder="e.g. Woodbridge"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-green-500">State</label>
            <input
              name="state"
              defaultValue={state}
              className="mt-1 rounded-md border px-2 py-1 text-sm"
              placeholder="e.g. NJ"
            />
          </div>
          <button
            type="submit"
            className="rounded-md border px-3 py-1.5 text-sm text-turf-green-500 hover:bg-pastel-green-500/30"
          >
            Filter
          </button>
        </form>

        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-offwhite">
              <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-[0.1em] text-slate-green-500">Name</th>
              <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-[0.1em] text-slate-green-500">Email</th>
              <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-[0.1em] text-slate-green-500">City</th>
              <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-[0.1em] text-slate-green-500">State</th>
              <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-[0.1em] text-slate-green-500">Past payout</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((c) => (
              <tr key={c.id} className="border-b border-pastel-green-500 last:border-0">
                <td className="px-4 py-3 text-turf-green-500">{c.first_name ?? "—"}</td>
                <td className="px-4 py-3 text-turf-green-500">{c.email}</td>
                <td className="px-4 py-3 text-turf-green-500">{c.city ?? "—"}</td>
                <td className="px-4 py-3 text-turf-green-500">{c.state ?? "—"}</td>
                <td className="px-4 py-3 text-turf-green-500">{formatCentsAsWholeDollars(c.past_payout_amount_cents)}</td>
              </tr>
            ))}
            {contacts.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-green-500">
                  No contacts yet — upload a CSV above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
