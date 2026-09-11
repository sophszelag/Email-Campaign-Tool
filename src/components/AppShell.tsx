import Link from "next/link";
import SignOutButton from "@/components/SignOutButton";

export default function AppShell({
  userEmail,
  children,
}: {
  userEmail: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#fafaf9]">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-6">
            <span className="text-lg font-bold text-turf-green-500">Event Campaign Tool</span>
            <nav className="flex items-center gap-4 text-sm">
              <Link href="/dashboard" className="text-slate-green-500 hover:text-turf-green-500">
                Campaigns
              </Link>
              <Link href="/contacts" className="text-slate-green-500 hover:text-turf-green-500">
                Contacts
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-green-500">
            <span>{userEmail}</span>
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
    </div>
  );
}
