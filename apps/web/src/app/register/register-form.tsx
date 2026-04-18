"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "next-auth/react";
import { FormEvent, useState } from "react";

type RegisterApiResponse = {
  ok: boolean;
  error?: { message?: string };
};

const formClassName =
  "grid gap-4 rounded-2xl border border-black/15 bg-white p-4 shadow-[0_14px_30px_-24px_rgba(20,23,31,0.65)]";

export function RegisterForm() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const nameInputId = "register-name";
  const emailInputId = "register-email";
  const passwordInputId = "register-password";
  const errorId = "register-form-error";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(event.currentTarget);
    const payload = {
      name: String(form.get("name") ?? "").trim(),
      email: String(form.get("email") ?? "").trim(),
      password: String(form.get("password") ?? ""),
    };

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const result = (await response.json()) as RegisterApiResponse;

    if (!response.ok || !result.ok) {
      setLoading(false);
      setError(result.error?.message ?? "Registration failed.");
      return;
    }

    const signInResult = await signIn("credentials", {
      email: payload.email,
      password: payload.password,
      redirect: false,
      callbackUrl: "/dashboard",
    });

    setLoading(false);

    if (!signInResult || signInResult.error) {
      setError("Account created, but automatic login failed.");
      return;
    }

    window.location.href = signInResult.url ?? "/dashboard";
  }

  return (
    <form onSubmit={handleSubmit} className={formClassName}>
      <div className="grid gap-1.5">
        <Label htmlFor={nameInputId}>Full name</Label>
        <Input
          id={nameInputId}
          type="text"
          name="name"
          placeholder="Your full name"
          autoComplete="name"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          required
        />
      </div>

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
          placeholder="Minimum 8 characters"
          autoComplete="new-password"
          minLength={8}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          required
        />
      </div>

      <Button type="submit" disabled={loading} className="w-full rounded-full">
        {loading ? "Creating account..." : "Create account"}
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
    </form>
  );
}
