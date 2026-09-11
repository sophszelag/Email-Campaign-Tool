import ProductLogo from "@/components/ProductLogo";
import NavLinks from "@/components/NavLinks";
import SignOutButton from "@/components/SignOutButton";

export default function AppShell({
  userEmail,
  title,
  subtitle,
  actions,
  children,
}: {
  userEmail: string;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  const initial = userEmail.trim().charAt(0).toUpperCase() || "?";

  return (
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-[240px_1fr]">
      <aside className="flex flex-col border-r bg-white py-5 md:min-h-screen">
        <div className="mb-4 border-b px-5 pb-6">
          <ProductLogo className="block" />
          <div className="mt-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-green-500">
            Event Campaign Tool
          </div>
        </div>

        <div className="px-5 pb-2 pt-3 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-green-500">
          Workspace
        </div>
        <NavLinks />

        <div className="mt-auto border-t px-5 pt-4 text-xs">
          <SignOutButton />
        </div>
      </aside>

      <div className="bg-canvas">
        <main className="px-8 pb-10 pt-6 md:pt-8">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-[22px] font-black tracking-tight text-turf-green-500">{title}</h1>
              {subtitle && <p className="mt-0.5 text-[13px] text-slate-green-500">{subtitle}</p>}
            </div>
            <div className="flex items-center gap-3">
              {actions}
              <div className="flex items-center gap-2.5 rounded-full border bg-white py-1.5 pl-1.5 pr-3.5 text-sm font-medium text-turf-green-500">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-turf-green-500 text-xs font-bold text-white">
                  {initial}
                </span>
                {userEmail}
              </div>
            </div>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
