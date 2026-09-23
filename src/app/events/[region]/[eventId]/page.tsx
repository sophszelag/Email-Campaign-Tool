import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/session";
import { store } from "@/lib/db/store";
import { EMAIL_TEMPLATES, renderReminderEmailHtml } from "@/lib/email/reminder-template";
import { defaultEventEmail } from "@/lib/event-email-defaults";
import AppShell from "@/components/AppShell";
import { updateEvent, deleteEvent, initializeEventEmail, updateEventEmail, clearEventEmail } from "../actions";

export const dynamic = "force-dynamic";

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ region: string; eventId: string }>;
}) {
  const session = await requireSession();
  const { region: slug, eventId } = await params;

  const region = store.regions.find((r) => r.slug === slug);
  if (!region) notFound();

  const event = store.events.find((e) => e.id === eventId && e.region_id === region.id);
  if (!event) notFound();

  const boundUpdate = updateEvent.bind(null, region.id, event.id);
  const boundDelete = deleteEvent.bind(null, region.id, event.id);
  const boundInitEmail = initializeEventEmail.bind(null, region.id, event.id);
  const boundUpdateEmail = updateEventEmail.bind(null, region.id, event.id);
  const boundClearEmail = clearEventEmail.bind(null, region.id, event.id);

  const emailContent = event.email ?? defaultEventEmail(region);
  const previewHtml = renderReminderEmailHtml(emailContent.template_id, emailContent);

  return (
    <AppShell userEmail={session.user!.email!} title="Edit event" subtitle={region.name}>
      <div className="mb-6">
        <Link
          href={`/events/${region.slug}`}
          className="text-[13px] font-medium text-slate-green-500 hover:text-turf-green-500"
        >
          ← Back to events
        </Link>
      </div>

      <section className="rounded-[10px] border bg-white p-5 shadow-sm">
        <form action={boundUpdate} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-green-500">
              Venue
            </label>
            <input
              name="venue"
              required
              defaultValue={event.venue}
              className="rounded-md border px-3 py-2 text-sm text-turf-green-500 focus:border-turf-green-500 focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-green-500">
              City, state
            </label>
            <input
              name="city_state"
              required
              defaultValue={event.city_state}
              className="rounded-md border px-3 py-2 text-sm text-turf-green-500 focus:border-turf-green-500 focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-green-500">
              Start date
            </label>
            <input
              type="date"
              name="start_date"
              required
              defaultValue={event.start_date}
              className="rounded-md border px-3 py-2 text-sm text-turf-green-500 focus:border-turf-green-500 focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-green-500">
              End date (optional)
            </label>
            <input
              type="date"
              name="end_date"
              defaultValue={event.end_date ?? ""}
              className="rounded-md border px-3 py-2 text-sm text-turf-green-500 focus:border-turf-green-500 focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-green-500">
              Hours (optional)
            </label>
            <input
              name="hours"
              defaultValue={event.hours ?? ""}
              className="rounded-md border px-3 py-2 text-sm text-turf-green-500 focus:border-turf-green-500 focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-green-500">
              Sub-region
            </label>
            <select
              name="subregion"
              defaultValue={event.subregion ?? ""}
              className="rounded-md border px-3 py-2 text-sm text-turf-green-500 focus:border-turf-green-500 focus:outline-none"
            >
              <option value="">Not tied to a specific area</option>
              {region.subregion_options.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-green-500">
              Capacity (optional)
            </label>
            <input
              type="number"
              name="capacity"
              min={1}
              placeholder="e.g. 50"
              defaultValue={event.capacity ?? ""}
              className="rounded-md border px-3 py-2 text-sm text-turf-green-500 focus:border-turf-green-500 focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-green-500">
              Status
            </label>
            <select
              name="status"
              defaultValue={event.status}
              className="rounded-md border px-3 py-2 text-sm text-turf-green-500 focus:border-turf-green-500 focus:outline-none"
            >
              <option value="upcoming">Upcoming</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <button
              type="submit"
              className="rounded-md bg-turf-green-500 px-4 py-2 text-sm font-bold text-white hover:bg-[#18201D]"
            >
              Save changes
            </button>
          </div>
        </form>

        <form action={boundDelete} className="mt-4 border-t pt-4">
          <button
            type="submit"
            className="rounded-md border px-4 py-2 text-sm font-bold text-red-500 hover:bg-offwhite"
          >
            Delete event
          </button>
        </form>
      </section>

      <section className="mt-6 rounded-[10px] border bg-white p-5 shadow-sm">
        <h2 className="mb-1 text-sm font-bold text-turf-green-500">Reminder email for this event</h2>

        {!event.email ? (
          <>
            <p className="mb-4 text-[13px] text-slate-green-500">
              Right now this event uses the region&apos;s default reminder email (see Settings).
              Set up a custom one — different template, different wording — just for this event.
            </p>
            <form action={boundInitEmail}>
              <button
                type="submit"
                className="rounded-md bg-turf-green-500 px-4 py-2 text-sm font-bold text-white hover:bg-[#18201D]"
              >
                Customize email for this event
              </button>
            </form>
          </>
        ) : (
          <>
            <p className="mb-4 text-[13px] text-slate-green-500">
              This event has its own reminder email, overriding the region default.
            </p>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
              <div>
                <form action={boundUpdateEmail} className="space-y-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-green-500">
                      Template
                    </label>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                      {EMAIL_TEMPLATES.map((t) => (
                        <label
                          key={t.id}
                          className="flex cursor-pointer flex-col gap-1 rounded-md border p-3 has-[:checked]:border-turf-green-500 has-[:checked]:bg-pastel-green-500/20"
                        >
                          <span className="flex items-center gap-2 text-sm font-bold text-turf-green-500">
                            <input
                              type="radio"
                              name="template_id"
                              value={t.id}
                              defaultChecked={emailContent.template_id === t.id}
                            />
                            {t.name}
                          </span>
                          <span className="text-xs text-slate-green-500">{t.description}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-green-500">
                      Subject
                    </label>
                    <input
                      name="subject"
                      defaultValue={emailContent.subject}
                      className="rounded-md border px-3 py-2 text-sm text-turf-green-500 focus:border-turf-green-500 focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-green-500">
                      Headline
                    </label>
                    <input
                      name="headline"
                      defaultValue={emailContent.headline}
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
                      defaultValue={emailContent.intro}
                      className="rounded-md border px-3 py-2 text-sm text-turf-green-500 focus:border-turf-green-500 focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-green-500">
                      Button label
                    </label>
                    <input
                      name="button_label"
                      defaultValue={emailContent.button_label}
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
                      defaultValue={emailContent.closing}
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
                      defaultValue={emailContent.send_days_before_event}
                      className="w-32 rounded-md border px-3 py-2 text-sm text-turf-green-500 focus:border-turf-green-500 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="rounded-md bg-turf-green-500 px-4 py-2 text-sm font-bold text-white hover:bg-[#18201D]"
                  >
                    Save email
                  </button>
                </form>

                <form action={boundClearEmail} className="mt-4 border-t pt-4">
                  <button
                    type="submit"
                    className="rounded-md border px-4 py-2 text-sm font-bold text-red-500 hover:bg-offwhite"
                  >
                    Revert to region default
                  </button>
                </form>
              </div>

              <div className="lg:sticky lg:top-6 lg:self-start">
                <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.1em] text-slate-green-500">
                  Live preview
                </div>
                <p className="mb-3 text-xs text-slate-green-500">
                  Shows what&apos;s currently saved, with sample details filled in. Save to refresh it.
                </p>
                <iframe
                  title="Event reminder email preview"
                  srcDoc={previewHtml}
                  className="h-[720px] w-full rounded-[10px] border bg-white shadow-sm"
                />
              </div>
            </div>
          </>
        )}
      </section>
    </AppShell>
  );
}
