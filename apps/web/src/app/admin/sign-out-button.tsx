"use client";

import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <Button
      type="button"
      onClick={() => signOut({ callbackUrl: "/" })}
      tone="secondary"
      className="rounded-full"
    >
      Sign out
    </Button>
  );
}
