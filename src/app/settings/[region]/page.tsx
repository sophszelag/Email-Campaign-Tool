import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/session";
import { store } from "@/lib/db/store";
import { REMINDER_EMAIL_MERGE_FIELDS } from "@/lib/reminder-email-defaults";
import AppShell from "@/components/AppShell";
import { updateReminderEmailSettings } from "./actions";

export const dynamic = "force-dynamic";

export default async function RegionSettingsPage({
  params,
}: {
  params: Promise<{ region: string }>;
}) {
  const session = await requireSession();
  const { region: slug } = await params;

  const region = store.regions.find((r) => r.slug === slug);
  if (!region) notFound();

  const boundUpdate = updateReminderEmailSettings.bind(null, region.id);

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

      <section className="rounded-[10px] border bg-white p-5 shadow-sm">
        <h2 className="mb-1 text-sm font-bold text-turf-green-500">Reminder email</h2>
        <p className="mb-4 text-[13px] text-slate-green-500">
          What gets sent to someone who signed up for reminders, and how far ahead of an event it
          goes out. This saves your settings now — the send itself isn&apos;t wired up yet, since it
          needs a real event schedule and the emailing account still being set up.
        </p>

        <form action={boundUpdate} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-green-500">
              Subject
            </label>
            <input
              name="subject"
              defaultValue={region.reminder_email.subject}
              className="rounded-md border px-3 py-2 text-sm text-turf-green-500 focus:border-turf-green-500 focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-green-500">
              Body
            </label>
            <textarea
              name="body"
              rows={10}
              defaultValue={region.reminder_email.body}
              className="rounded-md border px-3 py-2 text-sm text-turf-green-500 focus:border-turf-green-500 focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-green-500">
              Send this many days before the event
            </label>
            <input
              type="number"
              name="send_days_before_event"
              min={1}
              defaultValue={region.reminder_email.send_days_before_event}
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

        <div className="mt-5 border-t pt-4">
          <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.08em] text-slate-green-500">
            Available merge fields
          </div>
          <ul className="space-y-1 text-xs text-slate-green-500">
            {REMINDER_EMAIL_MERGE_FIELDS.map((f) => (
              <li key={f.field}>
                <code className="rounded bg-offwhite px-1.5 py-0.5 text-turf-green-500">{f.field}</code>{" "}
                — {f.description}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </AppShell>
  );
}
