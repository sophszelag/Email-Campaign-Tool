import { NextRequest, NextResponse } from "next/server";
import { verifyUnsubscribeToken } from "@/lib/unsubscribe-token";
import { getSupabaseServerClient } from "@/lib/supabase/server";

// Public endpoint — the link in every campaign email points here. No
// login required (that's the point of a one-click unsubscribe), but the
// token proves the request actually came from that email's link.
export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get("email")?.trim().toLowerCase();
  const token = request.nextUrl.searchParams.get("token");

  if (!email || !token || !verifyUnsubscribeToken(email, token)) {
    return NextResponse.redirect(new URL("/unsubscribe?status=invalid", request.url));
  }

  const supabase = getSupabaseServerClient();

  const { error } = await supabase
    .from("suppressions")
    .upsert({ email, reason: "unsubscribed" }, { onConflict: "email" });

  if (error) {
    return NextResponse.redirect(new URL("/unsubscribe?status=error", request.url));
  }

  // Best-effort: also mark any queued sends for this email so they're
  // visibly excluded rather than just silently skipped at send time.
  const { data: contact } = await supabase
    .from("contacts")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (contact) {
    await supabase
      .from("campaign_recipients")
      .update({ status: "unsubscribed" })
      .eq("contact_id", contact.id)
      .eq("status", "queued");
  }

  return NextResponse.redirect(new URL("/unsubscribe?status=done", request.url));
}
