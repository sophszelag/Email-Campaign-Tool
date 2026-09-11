import type { CampaignStatus } from "@/types";

// Matches the badge-draft/badge-scheduled/badge-sent classes from
// sidelineswap-event-campaign-tool-mockup.html.
const STYLES: Record<CampaignStatus, string> = {
  draft: "bg-turf-green-50 text-turf-green-500",
  sending: "bg-green-100 text-turf-green-500",
  sent: "bg-pastel-green-500 text-turf-green-500",
};

const LABELS: Record<CampaignStatus, string> = {
  draft: "Draft",
  sending: "Sending",
  sent: "Sent",
};

export default function StatusBadge({ status }: { status: CampaignStatus }) {
  return (
    <span
      className={`inline-block whitespace-nowrap rounded px-2 py-1 text-[10px] font-bold uppercase tracking-[0.1em] ${STYLES[status]}`}
    >
      {LABELS[status]}
    </span>
  );
}
