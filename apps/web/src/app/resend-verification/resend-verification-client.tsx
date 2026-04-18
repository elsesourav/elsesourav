"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader, PageShell } from "@/components/ui/page";
import Link from "next/link";
import { FormEvent, useState } from "react";

export function ResendVerificationClient() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const emailInputId = "resend-verification-email";
  const errorId = "resend-verification-error";

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      const payload = (await response.json()) as {
        ok: boolean;
        data?: { message?: string };
        error?: { message?: string };
      };

      if (!response.ok || !payload.ok) {
        setError(
          payload.error?.message ?? "Failed to resend verification email.",
        );
        return;
      }

      setMessage(
        payload.data?.message ??
          "If your account exists, a verification email has been sent.",
      );
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Failed to resend verification email.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageShell width="narrow" center className="gap-6">
      <PageHeader
        eyebrow="Account Verification"
        title="Resend verification"
        description="Did not get an email? Request a new verification link."
        align="center"
      />

      <form
        onSubmit={onSubmit}
        className="ui-card grid gap-4 rounded-2xl border p-4"
      >
        <div className="grid gap-1.5">
          <Label htmlFor={emailInputId}>Email</Label>
          <Input
            id={emailInputId}
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errorId : undefined}
            required
          />
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full rounded-full"
        >
          {loading ? "Sending..." : "Resend verification"}
        </Button>
      </form>

      {message ? (
        <p
          className="text-sm text-emerald-700"
          role="status"
          aria-live="polite"
        >
          {message}
        </p>
      ) : null}
      {error ? (
        <p
          id={errorId}
          className="text-sm text-red-600"
          role="alert"
          aria-live="polite"
        >
          {error}
        </p>
      ) : null}

      <p className="ui-text-muted text-center text-sm">
        Back to{" "}
        <Link href="/login" className="underline decoration-black/20">
          sign in
        </Link>
      </p>
    </PageShell>
  );
}
