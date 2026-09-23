"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/events", label: "Events" },
  { href: "/reminders", label: "Reminder signups" },
  { href: "/forms", label: "Form links" },
  { href: "/settings", label: "Settings" },
];

export default function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col">
      {ITEMS.map((item) => {
        const active = pathname === item.href || pathname?.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={
              active
                ? "border-l-[3px] border-green-500 bg-green-50 px-5 py-2.5 text-sm font-bold text-turf-green-500"
                : "border-l-[3px] border-transparent px-5 py-2.5 text-sm font-medium text-slate-green-500 hover:bg-offwhite"
            }
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
