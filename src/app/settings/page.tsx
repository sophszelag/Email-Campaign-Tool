import Link from "next/link";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/session";
import { store } from "@/lib/db/store";
import AppShell from "@/components/AppShell";

export const dynamic = "force-dynamic";

export default async function SettingsIndexPage() {
  const session = await requireSession();

  // Today there's only one region, so skip straight to its settings. Once
  // more regions exist, this index is what a manager sees across all of them.
  if (store.regions.length === 1) {
    redirect(`/settings/${store.regions[0].slug}`);
  }

  return (
    <AppShell userEmail={session.user!.email!} title="Settings" subtitle="Choose a region">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {store.regions.map((region) => (
          <Link
            key={region.id}
            href={`/settings/${region.slug}`}
            className="rounded-[10px] border bg-white p-5 shadow-sm hover:border-green-500"
          >
            <div className="font-bold text-turf-green-500">{region.name}</div>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
