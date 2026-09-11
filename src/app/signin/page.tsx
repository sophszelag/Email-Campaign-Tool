"use client";

import { Suspense } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

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
        onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
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
