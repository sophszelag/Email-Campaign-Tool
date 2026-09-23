import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/session";
import { store } from "@/lib/db/store";
import { REMINDER_EMAIL_MERGE_FIELDS } from "@/lib/reminder-email-defaults";
import { renderReminderEmailHtml } from "@/lib/email/reminder-template";
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
  const previewHtml = renderReminderEmailHtml("classic", region.reminder_email);

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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
        <section className="rounded-[10px] border bg-white p-5 shadow-sm">
          <h2 className="mb-1 text-sm font-bold text-turf-green-500">Reminder email</h2>
          <p className="mb-4 text-[13px] text-slate-green-500">
            The wording for this region&apos;s reminder email — the design (colors, layout, logo)
            is fixed and shared across every region, so only the content below is customizable.
            Saving isn&apos;t the same as sending: the send itself isn&apos;t wired up yet, since it
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
                Headline
              </label>
              <input
                name="headline"
                defaultValue={region.reminder_email.headline}
                className="rounded-md border px-3 py-2 text-sm text-turf-green-500 focus:border-turf-green-500 focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-green-500">
                Intro
              </label>
              <textarea
                name="intro"
                rows={5}
                defaultValue={region.reminder_email.intro}
                className="rounded-md border px-3 py-2 text-sm text-turf-green-500 focus:border-turf-green-500 focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-green-500">
                Button label
              </label>
              <input
                name="button_label"
                defaultValue={region.reminder_email.button_label}
                className="w-64 rounded-md border px-3 py-2 text-sm text-turf-green-500 focus:border-turf-green-500 focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-green-500">
                Closing
              </label>
              <textarea
                name="closing"
                rows={3}
                defaultValue={region.reminder_email.closing}
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

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-green-500">
                Reply-to email (coordinator&apos;s inbox)
              </label>
              <input
                type="email"
                name="reply_to_email"
                placeholder="coordinator@gmail.com"
                defaultValue={region.reminder_email.reply_to_email}
                className="rounded-md border px-3 py-2 text-sm text-turf-green-500 focus:border-turf-green-500 focus:outline-none"
              />
              <p className="text-xs text-slate-green-500">
                The email will still send from a branded SidelineSwap address, but when a customer
                hits reply, it&apos;ll land here instead.
              </p>
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

        <section className="lg:sticky lg:top-6 lg:self-start">
          <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.1em] text-slate-green-500">
            Live preview
          </div>
          <p className="mb-3 text-xs text-slate-green-500">
            Shows what&apos;s currently saved, with sample name/event details filled in. Save to
            refresh it.
          </p>
          <iframe
            title="Reminder email preview"
            srcDoc={previewHtml}
            className="h-[720px] w-full rounded-[10px] border bg-white shadow-sm"
          />
        </section>
      </div>
    </AppShell>
  );
}
