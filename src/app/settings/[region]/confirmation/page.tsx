import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/session";
import { store } from "@/lib/db/store";
import { REMINDER_EMAIL_MERGE_FIELDS } from "@/lib/reminder-email-defaults";
import { renderConfirmationEmailHtml } from "@/lib/email/confirmation-template";
import AppShell from "@/components/AppShell";
import { updateConfirmationEmailSettings } from "../actions";

export const dynamic = "force-dynamic";

export default async function ConfirmationEmailSettingsPage({
  params,
}: {
  params: Promise<{ region: string }>;
}) {
  const session = await requireSession();
  const { region: slug } = await params;

  const region = store.regions.find((r) => r.slug === slug);
  if (!region) notFound();

  const boundUpdate = updateConfirmationEmailSettings.bind(null, region.id);
  const previewHtml = renderConfirmationEmailHtml(region.confirmation_email);

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
        <span className="rounded-full bg-pastel-green-500 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.06em] text-turf-green-500">
          ✅ Confirmation email
        </span>
        <span className="text-[13px] text-slate-green-500">
          Sent immediately after someone pre-registers
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
        <section className="rounded-[10px] border border-t-[3px] border-t-turf-green-500 bg-white p-5 shadow-sm">
          <h2 className="mb-1 text-sm font-bold text-turf-green-500">Confirmation email content</h2>
          <p className="mb-4 text-[13px] text-slate-green-500">
            The wording for the email a customer gets right after pre-registering. Event location,
            date, and hours come in automatically via merge fields — no need to type them per
            event. The trade-in guidelines (what we accept/don&apos;t accept) are fixed and the same
            for every region, so they aren&apos;t editable here.
          </p>

          <form action={boundUpdate} className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-green-500">
                Subject
              </label>
              <input
                name="subject"
                defaultValue={region.confirmation_email.subject}
                className="rounded-md border px-3 py-2 text-sm text-turf-green-500 focus:border-turf-green-500 focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-green-500">
                Headline
              </label>
              <input
                name="headline"
                defaultValue={region.confirmation_email.headline}
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
                defaultValue={region.confirmation_email.intro}
                className="rounded-md border px-3 py-2 text-sm text-turf-green-500 focus:border-turf-green-500 focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-green-500">
                Closing
              </label>
              <textarea
                name="closing"
                rows={3}
                defaultValue={region.confirmation_email.closing}
                className="rounded-md border px-3 py-2 text-sm text-turf-green-500 focus:border-turf-green-500 focus:outline-none"
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

        <section className="lg:sticky lg:top-6 lg:self-start">
          <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.1em] text-slate-green-500">
            Live preview
          </div>
          <p className="mb-3 text-xs text-slate-green-500">
            Shows what&apos;s currently saved, with sample name/event details filled in. Save to
            refresh it.
          </p>
          <iframe
            title="Confirmation email preview"
            srcDoc={previewHtml}
            className="h-[820px] w-full rounded-[10px] border bg-white shadow-sm"
          />
        </section>
      </div>
    </AppShell>
  );
}
