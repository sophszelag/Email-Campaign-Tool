import { notFound } from "next/navigation";
import { store } from "@/lib/db/store";
import { getNextUpcomingEvent, formatEventDate } from "@/lib/events";
import PortalPage from "@/components/portal/PortalPage";
import { EventBadge } from "@/components/portal/PortalForm";
import PreRegistrationForm from "@/app/preregister/[region]/PreRegistrationForm";

export const dynamic = "force-dynamic";

export default async function PreRegisterPage({
  params,
}: {
  params: Promise<{ region: string }>;
}) {
  const { region: slug } = await params;
  const region = store.regions.find((r) => r.slug === slug);
  if (!region) notFound();

  const event = getNextUpcomingEvent(region.id);

  return (
    <PortalPage title="Trade-In Self Registration" subtitle="Register for your event">
      <h1 className="mb-1.5 text-[32px] font-extrabold tracking-tight text-portal-ink sm:text-[36px]">
        Register for trade-in
      </h1>
      <p className="mb-8 text-[15px] leading-relaxed text-portal-ink-secondary">
        Pre-register before you arrive to skip the line — just drop off your gear and go when you get
        to the event.
      </p>

      {event ? (
        <EventBadge
          eyebrow="Event"
          name={`${event.venue} · ${event.city_state}`}
          sub={event.hours ? `${formatEventDate(event)} · ${event.hours}` : formatEventDate(event)}
        />
      ) : (
        <EventBadge
          eyebrow="Event"
          name={`Upcoming ${region.name} trade-in event`}
          sub="Exact date, time, and location will be confirmed by email"
        />
      )}

      <PreRegistrationForm
        regionId={region.id}
        eventId={event?.id ?? null}
        fieldLabels={region.preregister_form.field_labels}
        customQuestions={region.preregister_form.custom_questions}
      />
    </PortalPage>
  );
}
