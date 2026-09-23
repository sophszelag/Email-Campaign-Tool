"use client";

import { useState } from "react";

export default function CopyLinkButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API can be unavailable (permissions, non-HTTPS); the
      // link is still selectable/copyable by hand right next to this button.
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="rounded-md bg-turf-green-500 px-4 py-2 text-sm font-bold text-white hover:bg-[#18201D]"
    >
      {copied ? "Copied!" : "Copy link"}
    </button>
  );
}
