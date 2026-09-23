import { headers } from "next/headers";
import Link from "next/link";
import { requireSession } from "@/lib/session";
import { store } from "@/lib/db/store";
import AppShell from "@/components/AppShell";
import CopyLinkButton from "@/components/CopyLinkButton";

export const dynamic = "force-dynamic";

export default async function FormLinksPage() {
  const session = await requireSession();

  const hdrs = await headers();
  const origin = `${hdrs.get("x-forwarded-proto") ?? "https"}://${hdrs.get("host")}`;

  return (
    <AppShell
      userEmail={session.user!.email!}
      title="Form links"
      subtitle="The public forms customers use, one set per region"
    >
      <div className="space-y-6">
        {store.regions.map((region) => (
          <div key={region.id} className="rounded-[10px] border bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-bold text-turf-green-500">{region.name}</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <LinkRow
                label="Reminder signup form"
                url={`${origin}/signup/${region.slug}`}
                editHref={`/forms/${region.slug}/edit/signup`}
              />
              <LinkRow
                label="Trade-in pre-registration form"
                url={`${origin}/preregister/${region.slug}`}
                editHref={`/forms/${region.slug}/edit/preregister`}
              />
            </div>
          </div>
        ))}
        {store.regions.length === 0 && (
          <p className="rounded-[10px] border bg-white p-5 text-sm text-slate-green-500 shadow-sm">
            No regions set up yet.
          </p>
        )}
      </div>
    </AppShell>
  );
}

function LinkRow({ label, url, editHref }: { label: string; url: string; editHref: string }) {
  return (
    <div>
      <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.1em] text-slate-green-500">
        {label}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <code className="break-all rounded-md bg-offwhite px-3 py-2 text-xs text-turf-green-500">{url}</code>
        <CopyLinkButton text={url} />
        <Link
          href={editHref}
          className="rounded-md border px-4 py-2 text-sm font-bold text-turf-green-500 hover:bg-offwhite"
        >
          Edit questions
        </Link>
      </div>
    </div>
  );
}
