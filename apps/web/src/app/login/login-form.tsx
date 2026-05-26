"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { FormEvent, useState } from "react";

const formClassName =
  "grid gap-4 rounded-2xl border border-black/15 bg-white p-4 shadow-[0_14px_30px_-24px_rgba(20,23,31,0.65)]";

export function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const emailInputId = "login-email";
  const passwordInputId = "login-password";
  const errorId = "login-form-error";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl: "/dashboard",
    });

    setLoading(false);

    if (!result || result.error) {
      setError("Invalid email or password.");
      return;
    }

    window.location.href = result.url ?? "/dashboard";
  }

  async function loginWithGithub() {
    await signIn("github", { callbackUrl: "/dashboard" });
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className={formClassName}>
        <div className="grid gap-1.5">
          <Label htmlFor={emailInputId}>Email</Label>
          <Input
            id={emailInputId}
            type="email"
            name="email"
            placeholder="you@example.com"
            autoComplete="email"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errorId : undefined}
            required
          />
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor={passwordInputId}>Password</Label>
          <Input
            id={passwordInputId}
            type="password"
            name="password"
            placeholder="Enter your password"
            autoComplete="current-password"
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
          {loading ? "Signing in..." : "Sign in"}
        </Button>
      </form>

      <Button
        type="button"
        onClick={loginWithGithub}
        variant="secondary"
        className="w-full rounded-full"
      >
        Continue with GitHub
      </Button>

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

      <div className="flex flex-wrap gap-3 text-sm text-[#3f4757]">
        <Link href="/forgot-password" className="underline decoration-black/20">
          Forgot password?
        </Link>
        <Link
          href="/resend-verification"
          className="underline decoration-black/20"
        >
          Resend verification email
        </Link>
      </div>
    </div>
  );
}
