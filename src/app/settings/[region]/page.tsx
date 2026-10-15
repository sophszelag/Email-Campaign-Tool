import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/session";
import { store } from "@/lib/db/store";
import AppShell from "@/components/AppShell";

export const dynamic = "force-dynamic";

export default async function RegionSettingsIndexPage({
  params,
}: {
  params: Promise<{ region: string }>;
}) {
  const session = await requireSession();
  const { region: slug } = await params;

  const region = store.regions.find((r) => r.slug === slug);
  if (!region) notFound();

  return (
    <AppShell userEmail={session.user!.email!} title="Settings" subtitle={region.name}>
      <div className="mb-6">
        <Link
          href="/settings"
          className="text-[13px] font-medium text-slate-green-500 hover:text-turf-green-500"
        >
          ← Back to settings
        </Link>
      </div>

      <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.1em] text-slate-green-500">
        Email templates
      </div>
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link
          href={`/settings/${region.slug}/reminder`}
          className="rounded-[10px] border border-t-[4px] border-t-green-500 bg-white p-5 shadow-sm hover:border-green-500"
        >
          <div className="mb-2 text-2xl">🔔</div>
          <div className="mb-1 font-bold text-turf-green-500">Event Reminder Email</div>
          <p className="text-[13px] text-slate-green-500">
            Sent to someone who signed up for reminders, a set number of days before an event — edit
            the wording and how many days ahead it sends.
          </p>
        </Link>

        <Link
          href={`/settings/${region.slug}/confirmation`}
          className="rounded-[10px] border border-t-[4px] border-t-turf-green-500 bg-white p-5 shadow-sm hover:border-turf-green-500"
        >
          <div className="mb-2 text-2xl">✅</div>
          <div className="mb-1 font-bold text-turf-green-500">Pre-Registration Confirmation Email</div>
          <p className="text-[13px] text-slate-green-500">
            Sent immediately after someone pre-registers — confirms it, and includes event details
            and trade-in guidelines.
          </p>
        </Link>
      </div>

      <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.1em] text-slate-green-500">
        Forms
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link
          href={`/forms/${region.slug}/edit/signup`}
          className="rounded-[10px] border border-t-[4px] border-t-pastel-green-500 bg-white p-5 shadow-sm hover:border-turf-green-500"
        >
          <div className="mb-2 text-2xl">📝</div>
          <div className="mb-1 font-bold text-turf-green-500">Reminder Signup Form</div>
          <p className="text-[13px] text-slate-green-500">
            Reword questions or add custom ones for the public reminder signup form.
          </p>
        </Link>

        <Link
          href={`/forms/${region.slug}/edit/preregister`}
          className="rounded-[10px] border border-t-[4px] border-t-pastel-green-500 bg-white p-5 shadow-sm hover:border-turf-green-500"
        >
          <div className="mb-2 text-2xl">📋</div>
          <div className="mb-1 font-bold text-turf-green-500">Trade-In Pre-Registration Form</div>
          <p className="text-[13px] text-slate-green-500">
            Reword questions or add custom ones for the public pre-registration form.
          </p>
        </Link>
      </div>
    </AppShell>
  );
}
