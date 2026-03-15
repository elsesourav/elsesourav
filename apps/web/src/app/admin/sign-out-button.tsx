"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/" })}
      className="rounded-full border border-black/10 bg-white px-3 py-2 text-sm text-[#14171f] transition hover:bg-[#f6f7fb]"
    >
      Sign out
    </button>
  );
}
