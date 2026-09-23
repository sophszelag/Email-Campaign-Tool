import { notFound } from "next/navigation";
import { store } from "@/lib/db/store";
import { formatEventDate } from "@/lib/events";
import PortalPage from "@/components/portal/PortalPage";
import { EventBadge } from "@/components/portal/PortalForm";
import PreRegistrationForm from "@/app/preregister/[region]/PreRegistrationForm";

export const dynamic = "force-dynamic";

export default async function PreRegisterForEventPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const event = store.events.find((e) => e.id === eventId);
  if (!event) notFound();

  const region = store.regions.find((r) => r.id === event.region_id);
  if (!region) notFound();

  if (event.status !== "upcoming") {
    return (
      <PortalPage title="Trade-In Self Registration" subtitle="Event registration closed">
        <h1 className="mb-1.5 text-[32px] font-extrabold tracking-tight text-portal-ink sm:text-[36px]">
          This event isn&apos;t taking registrations
        </h1>
        <p className="text-[15px] leading-relaxed text-portal-ink-secondary">
          {event.venue} · {event.city_state} has{" "}
          {event.status === "cancelled" ? "been cancelled" : "already happened"}. Check with
          SidelineSwap for other upcoming trade-in events near you.
        </p>
      </PortalPage>
    );
  }

  return (
    <PortalPage title="Trade-In Self Registration" subtitle="Register for your event">
      <h1 className="mb-1.5 text-[32px] font-extrabold tracking-tight text-portal-ink sm:text-[36px]">
        Register for trade-in
      </h1>
      <p className="mb-8 text-[15px] leading-relaxed text-portal-ink-secondary">
        Pre-register before you arrive to skip the line — just drop off your gear and go when you get
        to the event.
      </p>

      <EventBadge
        eyebrow="Event"
        name={`${event.venue} · ${event.city_state}`}
        sub={event.hours ? `${formatEventDate(event)} · ${event.hours}` : formatEventDate(event)}
      />

      <PreRegistrationForm
        regionId={region.id}
        eventId={event.id}
        fieldLabels={region.preregister_form.field_labels}
        customQuestions={region.preregister_form.custom_questions}
      />
    </PortalPage>
  );
}
