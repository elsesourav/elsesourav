"use client";

import { Button } from "@/components/ui/button";
import { PageHeader, PageShell } from "@/components/ui/page";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";

export function VerifyEmailClient() {
  const searchParams = useSearchParams();
  const token = useMemo(() => searchParams.get("token") ?? "", [searchParams]);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function verify(verificationToken: string) {
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ token: verificationToken }),
      });

      const payload = (await response.json()) as {
        ok: boolean;
        data?: { message?: string };
        error?: { message?: string };
      };

      if (!response.ok || !payload.ok) {
        setError(payload.error?.message ?? "Email verification failed.");
        return;
      }

      setMessage(payload.data?.message ?? "Email verified successfully.");
    } catch (verifyError) {
      setError(
        verifyError instanceof Error
          ? verifyError.message
          : "Email verification failed.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token) {
      setError("Missing verification token.");
      return;
    }

    await verify(token);
  }

  return (
    <PageShell width="narrow" center className="gap-6">
      <PageHeader
        eyebrow="Account Verification"
        title="Verify email"
        description="Confirm your email address to fully activate your account."
        align="center"
      />

      <form
        onSubmit={onSubmit}
        className="ui-card grid gap-3 rounded-2xl border p-4"
      >
        <p className="ui-text-muted text-sm">
          Use the verification link from your inbox, then click below.
        </p>
        <Button
          type="submit"
          disabled={loading || !token}
          className="w-full rounded-full"
        >
          {loading ? "Verifying..." : "Verify email"}
        </Button>
      </form>

      {!token ? (
        <p className="text-sm text-red-600" role="status" aria-live="polite">
          Verification link is invalid. Request a new one below.
        </p>
      ) : null}

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
        <p className="text-sm text-red-600" role="status" aria-live="polite">
          {error}
        </p>
      ) : null}

      <div className="ui-text-muted flex flex-wrap justify-center gap-3 text-sm">
        <Link
          href="/resend-verification"
          className="underline decoration-black/20"
        >
          Resend verification email
        </Link>
        <Link href="/login" className="underline decoration-black/20">
          Back to sign in
        </Link>
      </div>
    </PageShell>
  );
}
