import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/session";
import { store } from "@/lib/db/store";
import AppShell from "@/components/AppShell";
import { updateFeatureToggles } from "../actions";

export const dynamic = "force-dynamic";

export default async function FeatureTogglesPage({
  params,
}: {
  params: Promise<{ region: string }>;
}) {
  const session = await requireSession();
  const { region: slug } = await params;

  const region = store.regions.find((r) => r.slug === slug);
  if (!region) notFound();

  const boundUpdate = updateFeatureToggles.bind(null, region.id);

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
        <span className="rounded-full bg-turf-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.06em] text-turf-green-500">
          🎛️ Feature toggles
        </span>
        <span className="text-[13px] text-slate-green-500">
          Turn whole customer-facing areas on or off for this region
        </span>
      </div>

      <form action={boundUpdate} className="space-y-4">
        <ToggleRow
          name="reminder_signup"
          defaultChecked={region.features.reminder_signup}
          icon="🔔"
          title="Reminder Signup"
          description={`The public "remind me about the next trade-in event" form, and its confirmation email. Turning this off shows a friendly "not available right now" message instead of the form.`}
        />

        <ToggleRow
          name="pre_registration"
          defaultChecked={region.features.pre_registration}
          icon="📋"
          title="Pre-Registration"
          description="The public trade-in pre-registration form (region-wide and per-event links), and its confirmation email. Turning this off also turns off the referral program, since it only applies to pre-registration."
        />

        <ToggleRow
          name="referral_program"
          defaultChecked={region.features.referral_program}
          icon="💰"
          title="Referral Program"
          description="The refer-a-friend trade-in bonus, shown on the pre-registration form and its confirmation email. Only takes effect while Pre-Registration (above) is also on."
        />

        <button
          type="submit"
          className="rounded-md bg-turf-green-500 px-4 py-2 text-sm font-bold text-white hover:bg-[#18201D]"
        >
          Save
        </button>
      </form>
    </AppShell>
  );
}

function ToggleRow({
  name,
  defaultChecked,
  icon,
  title,
  description,
}: {
  name: string;
  defaultChecked: boolean;
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-4 rounded-[10px] border bg-white p-5 shadow-sm">
      <div className="relative mt-0.5 h-6 w-11 shrink-0 rounded-full bg-pastel-green-500 transition-colors has-[:checked]:bg-green-500">
        <input
          type="checkbox"
          name={name}
          defaultChecked={defaultChecked}
          className="peer absolute inset-0 cursor-pointer opacity-0"
        />
        <div className="pointer-events-none absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-[22px]" />
      </div>
      <div>
        <div className="font-bold text-turf-green-500">
          {icon} {title}
        </div>
        <p className="mt-1 text-[13px] text-slate-green-500">{description}</p>
      </div>
    </label>
  );
}
