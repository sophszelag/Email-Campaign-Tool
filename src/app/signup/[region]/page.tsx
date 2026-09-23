import { notFound } from "next/navigation";
import { store } from "@/lib/db/store";
import PortalPage from "@/components/portal/PortalPage";
import SignupForm from "@/app/signup/[region]/SignupForm";

export const dynamic = "force-dynamic";

export default async function RegionSignupPage({
  params,
}: {
  params: Promise<{ region: string }>;
}) {
  const { region: slug } = await params;
  const region = store.regions.find((r) => r.slug === slug);
  if (!region) notFound();

  return (
    <PortalPage title="Event Reminders" subtitle={region.name}>
      <h1 className="mb-1.5 text-[32px] font-extrabold tracking-tight text-portal-ink sm:text-[36px]">
        Remind me about the next trade-in event
      </h1>
      <p className="mb-8 text-[15px] leading-relaxed text-portal-ink-secondary">
        Tell us where you are, and we&apos;ll email you when we&apos;re heading your way.
      </p>

      <SignupForm
        regionId={region.id}
        subregionOptions={region.subregion_options}
        fieldLabels={region.signup_form.field_labels}
        customQuestions={region.signup_form.custom_questions}
      />

      <p className="mt-8 text-center text-xs text-portal-ink-tertiary">
        SidelineSwap · 155 Seaport Blvd, Boston, MA 02210
      </p>
    </PortalPage>
  );
}
