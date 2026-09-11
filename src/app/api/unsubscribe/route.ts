import { NextRequest, NextResponse } from "next/server";
import { verifyUnsubscribeToken } from "@/lib/unsubscribe-token";
import { store, upsertSuppression } from "@/lib/db/store";

// Public endpoint — the link in every campaign email points here. No
// login required (that's the point of a one-click unsubscribe), but the
// token proves the request actually came from that email's link.
export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get("email")?.trim().toLowerCase();
  const token = request.nextUrl.searchParams.get("token");

  if (!email || !token || !verifyUnsubscribeToken(email, token)) {
    return NextResponse.redirect(new URL("/unsubscribe?status=invalid", request.url));
  }

  upsertSuppression(email, "unsubscribed");

  // Best-effort: also mark any queued sends for this email so they're
  // visibly excluded rather than just silently skipped at send time.
  const contact = store.contacts.find((c) => c.email === email);
  if (contact) {
    for (const recipient of store.campaignRecipients) {
      if (recipient.contact_id === contact.id && recipient.status === "queued") {
        recipient.status = "unsubscribed";
      }
    }
  }

  return NextResponse.redirect(new URL("/unsubscribe?status=done", request.url));
}
