"use client";

import { signIn } from "next-auth/react";
import { FormEvent, useState } from "react";

type RegisterApiResponse = {
  ok: boolean;
  error?: { message?: string };
};

const formClassName =
  "grid gap-3 rounded-2xl border border-black/10 bg-white/90 p-4 shadow-[0_12px_28px_-22px_rgba(20,23,31,0.55)]";
const inputClassName =
  "rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-[#14171f] placeholder:text-[#6d7587]";
const buttonClassName =
  "rounded-full bg-[#14171f] px-4 py-2 text-sm font-medium text-white disabled:opacity-60";

export function RegisterForm() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
      callbackUrl: "/",
    });

    setLoading(false);

    if (!signInResult || signInResult.error) {
      setError("Account created, but automatic login failed.");
      return;
    }

    window.location.href = signInResult.url ?? "/";
  }

  return (
    <form onSubmit={handleSubmit} className={formClassName}>
      <input
        className={inputClassName}
        type="text"
        name="name"
        placeholder="Full name"
        required
      />
      <input
        className={inputClassName}
        type="email"
        name="email"
        placeholder="Email"
        autoComplete="email"
        required
      />
      <input
        className={inputClassName}
        type="password"
        name="password"
        placeholder="Password"
        autoComplete="new-password"
        minLength={8}
        required
      />
      <button type="submit" disabled={loading} className={buttonClassName}>
        {loading ? "Creating account..." : "Create account"}
      </button>
      {error ? (
        <p className="text-sm text-red-600" role="status" aria-live="polite">
          {error}
        </p>
      ) : null}
    </form>
  );
}
