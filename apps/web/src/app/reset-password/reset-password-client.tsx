"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader, PageShell } from "@/components/ui/page";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";

export function ResetPasswordClient() {
  const searchParams = useSearchParams();
  const token = useMemo(() => searchParams.get("token") ?? "", [searchParams]);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const passwordInputId = "reset-password-new";
  const confirmPasswordInputId = "reset-password-confirm";
  const errorId = "reset-password-error";

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setError(null);

    if (!token) {
      setError("Missing password reset token.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ token, password }),
      });

      const payload = (await response.json()) as {
        ok: boolean;
        data?: { message?: string };
        error?: { message?: string };
      };

      if (!response.ok || !payload.ok) {
        setError(payload.error?.message ?? "Failed to reset password.");
        return;
      }

      setMessage(payload.data?.message ?? "Password reset successful.");
      setPassword("");
      setConfirmPassword("");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Failed to reset password.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageShell width="narrow" center className="gap-6">
      <PageHeader
        eyebrow="Account Recovery"
        title="Reset password"
        description="Set a strong new password to secure your account."
        align="center"
      />

      <form
        onSubmit={onSubmit}
        className="ui-card grid gap-4 rounded-2xl border p-4"
      >
        <div className="grid gap-1.5">
          <Label htmlFor={passwordInputId}>New password</Label>
          <Input
            id={passwordInputId}
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="At least 8 characters"
            autoComplete="new-password"
            minLength={8}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errorId : "reset-password-hint"}
            required
          />
          <p id="reset-password-hint" className="ui-text-muted text-xs">
            Use a strong password with at least 8 characters.
          </p>
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor={confirmPasswordInputId}>Confirm password</Label>
          <Input
            id={confirmPasswordInputId}
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="Re-enter your new password"
            autoComplete="new-password"
            minLength={8}
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
          {loading ? "Updating..." : "Reset password"}
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
