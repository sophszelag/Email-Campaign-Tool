"use client";

import { useState } from "react";

export type PreviewOption = { id: string; label: string; html: string };

export default function PreviewPane({ options }: { options: PreviewOption[] }) {
  const [selectedId, setSelectedId] = useState(options[0]?.id);
  const selected = options.find((o) => o.id === selectedId) ?? options[0];

  if (!selected) {
    return <p className="p-6 text-sm text-slate-green-500">Add recipients to preview this email.</p>;
  }

  return (
    <div>
      <div className="flex items-center gap-3 border-b p-4">
        <label className="text-xs text-slate-green-500">Previewing as:</label>
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className="rounded-md border px-2 py-1 text-sm"
        >
          {options.map((o) => (
            <option key={o.id} value={o.id}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
      <iframe
        title="Email preview"
        srcDoc={selected.html}
        className="h-[600px] w-full"
        sandbox=""
      />
    </div>
  );
}
