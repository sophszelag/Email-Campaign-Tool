import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/session";
import { store } from "@/lib/db/store";
import { referralBonusPercent } from "@/types";
import AppShell from "@/components/AppShell";
import { updateReferralProgramSettings } from "../actions";

export const dynamic = "force-dynamic";

export default async function ReferralProgramSettingsPage({
  params,
}: {
  params: Promise<{ region: string }>;
}) {
  const session = await requireSession();
  const { region: slug } = await params;

  const region = store.regions.find((r) => r.slug === slug);
  if (!region) notFound();

  const boundUpdate = updateReferralProgramSettings.bind(null, region.id);
  const { per_referral_percent, max_percent } = region.referral_program;
  const maxReferralsThatMatter = Math.ceil(max_percent / per_referral_percent);

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
        <span className="rounded-full bg-green-100 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.06em] text-green-700">
          💰 Referral program
        </span>
        <span className="text-[13px] text-slate-green-500">
          Applies to the pre-registration form, success screen, and confirmation email
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <section className="rounded-[10px] border border-t-[3px] border-t-green-500 bg-white p-5 shadow-sm">
          <h2 className="mb-1 text-sm font-bold text-turf-green-500">Bonus amounts</h2>
          <p className="mb-4 text-[13px] text-slate-green-500">
            Every pre-registrant gets a unique shareable link. For each friend who pre-registers
            using it, the referrer earns a trade-in bonus, up to a cap.
          </p>

          <form action={boundUpdate} className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-green-500">
                Bonus per referral (%)
              </label>
              <input
                type="number"
                name="per_referral_percent"
                min={1}
                max={100}
                defaultValue={per_referral_percent}
                className="w-32 rounded-md border px-3 py-2 text-sm text-turf-green-500 focus:border-turf-green-500 focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-green-500">
                Maximum bonus (%)
              </label>
              <input
                type="number"
                name="max_percent"
                min={1}
                max={100}
                defaultValue={max_percent}
                className="w-32 rounded-md border px-3 py-2 text-sm text-turf-green-500 focus:border-turf-green-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="rounded-md bg-turf-green-500 px-4 py-2 text-sm font-bold text-white hover:bg-[#18201D]"
            >
              Save
            </button>
          </form>
        </section>

        <section className="lg:sticky lg:top-6 lg:self-start">
          <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.1em] text-slate-green-500">
            How this plays out
          </div>
          <div className="rounded-[10px] border bg-white p-4 shadow-sm">
            <table className="w-full text-left text-sm">
              <thead>
                <tr>
                  <th className="pb-2 text-[11px] font-bold uppercase tracking-[0.08em] text-slate-green-500">
                    Referrals
                  </th>
                  <th className="pb-2 text-[11px] font-bold uppercase tracking-[0.08em] text-slate-green-500">
                    Bonus
                  </th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: Math.min(maxReferralsThatMatter + 1, 6) }, (_, i) => i).map(
                  (count) => (
                    <tr key={count} className="border-t">
                      <td className="py-1.5 text-turf-green-500">{count}</td>
                      <td className="py-1.5 font-medium text-turf-green-500">
                        {referralBonusPercent(count, region.referral_program)}%
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-slate-green-500">
            Based on currently saved values. Save the form to recalculate.
          </p>
        </section>
      </div>
    </AppShell>
  );
}
