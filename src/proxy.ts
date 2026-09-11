import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Hand-rolled instead of re-exporting next-auth/middleware's `withAuth`:
// that module is still CommonJS and its `export { default }` re-export
// doesn't survive Next.js 16's Turbopack build (comes out `undefined`).
// `getToken` is the same check `withAuth` uses under the hood.
//
// This is an optimistic check only (Next's own guidance: Proxy shouldn't
// be the sole authorization mechanism) — every Server Action and page
// also calls requireSession()/getServerSession() itself.
export async function proxy(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    const signInUrl = new URL("/signin", request.url);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Everything requires a signed-in @sidelineswap.com session EXCEPT:
  // - /api/auth/*        (NextAuth's own sign-in/callback routes)
  // - /api/webhooks/*     (Resend's server-to-server webhook)
  // - /unsubscribe        (the public one-click unsubscribe page)
  // - /api/unsubscribe    (the link every email points to)
  // - /signin             (the sign-in page itself)
  // - static assets
  matcher: [
    "/((?!api/auth|api/webhooks|unsubscribe|api/unsubscribe|signin|_next/static|_next/image|favicon.ico).*)",
  ],
};
