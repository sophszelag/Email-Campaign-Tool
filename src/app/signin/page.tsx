"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

// next-auth/react parses NEXTAUTH_URL at module load, and throws if it's
// ever set to an empty string (e.g. an unfilled placeholder added during
// a Vercel import) rather than left unset. A top-level import would run
// that code during the server-side build/prerender too, turning one bad
// env var into a failed deployment for the whole app — so this module is
// loaded lazily, on click, in the browser only.
async function handleSignIn() {
  const { signIn } = await import("next-auth/react");
  await signIn("google", { callbackUrl: "/dashboard" });
}

function SignInCard() {
  const searchParams = useSearchParams();
  const hasError = searchParams.get("error") != null;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-turf-green-500">Event Campaign Tool</h1>
        <p className="mt-2 text-sm text-slate-green-500">
          Sign in with your @sidelineswap.com Google account.
        </p>
      </div>
      {hasError && (
        <p className="max-w-sm text-center text-sm text-red-500">
          That account isn&apos;t a @sidelineswap.com Google account, so it can&apos;t be used
          here. Try again with your SidelineSwap Google login.
        </p>
      )}
      <button
        onClick={() => handleSignIn()}
        className="rounded-md bg-turf-green-500 px-5 py-2.5 text-sm font-medium text-white hover:opacity-90"
      >
        Sign in with Google
      </button>
    </main>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={null}>
      <SignInCard />
    </Suspense>
  );
}
