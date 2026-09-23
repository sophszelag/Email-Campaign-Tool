import Link from "next/link";

/**
 * Shared chrome for the customer-facing self-service forms (reminder
 * signup + trade-in pre-registration) — the "portal", styled from
 * Trade-In Self Registration Form.html. Deliberately distinct from the
 * internal admin tool's forest-green look: near-black ink on a warm
 * canvas, dark-green header, green used only as an accent.
 */
export default function PortalPage({
  title,
  subtitle,
  backHref,
  children,
}: {
  title: string;
  subtitle?: string;
  backHref?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-portal-canvas text-portal-ink">
      <div className="sticky top-0 z-10 flex h-16 items-center gap-3.5 border-b border-black/20 bg-portal-header px-6 sm:px-8">
        {backHref && (
          <Link
            href={backHref}
            className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[13px] font-medium text-white/70 hover:bg-white/10 hover:text-white"
          >
            ← Back
          </Link>
        )}
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-white/10 text-sm font-black text-white">
          S
        </div>
        <div>
          <div className="text-[17px] font-extrabold tracking-tight text-white">{title}</div>
          {subtitle && <div className="text-xs tracking-wide text-white/55">{subtitle}</div>}
        </div>
      </div>

      <div className="mx-auto max-w-[640px] px-5 py-10 sm:px-10 sm:py-12">{children}</div>
    </div>
  );
}
