import { notFound } from "next/navigation";
import { store } from "@/lib/db/store";
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
    <main className="min-h-screen bg-[#F1EFE8] px-4 py-10 sm:py-16">
      <div className="mx-auto max-w-xl">
        <div className="mb-8 text-center">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-[#02C874]">
            {region.name}
          </p>
          <h1 className="text-3xl font-black tracking-tight text-[#253C32] sm:text-4xl">
            Remind me about the next <span className="text-[#02C874]">trade-in event</span>.
          </h1>
          <p className="mt-3 text-sm text-[#61716A]">
            Tell us where you are, and we&apos;ll email you when we&apos;re heading your way.
          </p>
        </div>
        <SignupForm regionId={region.id} subregionOptions={region.subregion_options} />
        <p className="mt-6 text-center text-xs text-[#61716A]">
          SidelineSwap · 155 Seaport Blvd, Boston, MA 02210
        </p>
      </div>
    </main>
  );
}
