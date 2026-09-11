"use client";

import { useState } from "react";
import { formatCentsAsWholeDollars } from "@/lib/money";
import type { Contact } from "@/types";

export default function RecipientsCheckboxList({ contacts }: { contacts: Contact[] }) {
  const [checked, setChecked] = useState<Set<string>>(new Set(contacts.map((c) => c.id)));

  const allChecked = checked.size === contacts.length && contacts.length > 0;

  function toggleAll() {
    setChecked(allChecked ? new Set() : new Set(contacts.map((c) => c.id)));
  }

  function toggleOne(id: string) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div>
      <div className="flex items-center justify-between border-b px-4 py-2 text-xs text-slate-green-500">
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={allChecked} onChange={toggleAll} />
          Select all shown ({checked.size} of {contacts.length} selected)
        </label>
      </div>
      <div className="max-h-96 overflow-y-auto">
        <table className="w-full text-left text-sm">
          <tbody>
            {contacts.map((c) => (
              <tr key={c.id} className="border-b last:border-0">
                <td className="w-8 px-4 py-2">
                  <input
                    type="checkbox"
                    name="contact_ids"
                    value={c.id}
                    checked={checked.has(c.id)}
                    onChange={() => toggleOne(c.id)}
                  />
                </td>
                <td className="px-2 py-2">{c.first_name ?? "—"}</td>
                <td className="px-2 py-2">{c.email}</td>
                <td className="px-2 py-2">
                  {c.city ?? "—"}
                  {c.state ? `, ${c.state}` : ""}
                </td>
                <td className="px-2 py-2">{formatCentsAsWholeDollars(c.past_payout_amount_cents)}</td>
              </tr>
            ))}
            {contacts.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-green-500">
                  No contacts match this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
