"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/" })}
      className="flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-sm font-medium text-[color-mix(in_srgb,var(--foreground)_60%,transparent)] transition hover:bg-[color-mix(in_srgb,var(--background)_90%,var(--foreground)_10%)]"
    >
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--background)_88%,var(--foreground)_12%)] text-[color-mix(in_srgb,var(--foreground)_55%,transparent)]">
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <path d="M16 17l5-5-5-5" />
          <path d="M21 12H9" />
        </svg>
      </span>
      Log out
    </button>
  );
}
