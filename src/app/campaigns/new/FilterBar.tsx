"use client";

import { useRouter } from "next/navigation";

export default function FilterBar({
  label,
  name,
  defaultValue,
}: {
  label: string;
  name: string;
  defaultValue?: string;
}) {
  const router = useRouter();

  return (
    <div>
      <label className="block text-xs text-slate-green-500">{label}</label>
      <input
        name={name}
        defaultValue={defaultValue}
        onBlur={(e) => {
          const url = new URL(window.location.href);
          if (e.target.value) url.searchParams.set(name, e.target.value);
          else url.searchParams.delete(name);
          router.push(`${url.pathname}?${url.searchParams.toString()}`);
        }}
        className="mt-1 rounded-md border px-2 py-1 text-sm"
      />
    </div>
  );
}
