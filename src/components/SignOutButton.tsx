"use client";

import { signOut } from "next-auth/react";

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/signin" })}
      className="text-slate-green-500 underline hover:text-turf-green-500"
    >
      Sign out
    </button>
  );
}
