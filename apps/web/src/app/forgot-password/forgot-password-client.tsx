"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader, PageShell } from "@/components/ui/page";
import Link from "next/link";
import { FormEvent, useState } from "react";

export function ForgotPasswordClient() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const emailInputId = "forgot-password-email";
  const errorId = "forgot-password-error";

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch("/api/auth/forgot-password", {
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
        setError(payload.error?.message ?? "Failed to request reset link.");
        return;
      }

      setMessage(
        payload.data?.message ??
          "If your account exists, a reset link has been sent.",
      );
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Failed to request reset link.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageShell width="narrow" center className="gap-6">
      <PageHeader
        eyebrow="Account Recovery"
        title="Forgot password"
        description="Enter your email and we will send password reset instructions."
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
          {loading ? "Sending..." : "Send reset link"}
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
        Remembered your password?{" "}
        <Link href="/login" className="underline decoration-black/20">
          Sign in
        </Link>
      </p>
    </PageShell>
  );
}
