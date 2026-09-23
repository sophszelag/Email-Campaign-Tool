import { notFound } from "next/navigation";
import { store } from "@/lib/db/store";
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

  return (
    <PortalPage title="Trade-In Self Registration" subtitle="Register for your event">
      <h1 className="mb-1.5 text-[32px] font-extrabold tracking-tight text-portal-ink sm:text-[36px]">
        Register for trade-in
      </h1>
      <p className="mb-8 text-[15px] leading-relaxed text-portal-ink-secondary">
        Pre-register before you arrive to skip the line — just drop off your gear and go when you get
        to the event.
      </p>

      {/*
        No real event schedule exists yet, so this shows a generic
        placeholder rather than a real venue/date. Once events are
        uploaded and linked to a region, swap this for the actual next
        event's details.
      */}
      <EventBadge
        eyebrow="Event"
        name={`Upcoming ${region.name} trade-in event`}
        sub="Exact date, time, and location will be confirmed by email"
      />

      <PreRegistrationForm
        regionId={region.id}
        fieldLabels={region.preregister_form.field_labels}
        customQuestions={region.preregister_form.custom_questions}
      />
    </PortalPage>
  );
}
