"use client";

import { signIn } from "next-auth/react";
import { FormEvent, useState } from "react";

const formClassName =
  "grid gap-3 rounded-2xl border border-black/10 bg-white/90 p-4 shadow-[0_12px_28px_-22px_rgba(20,23,31,0.55)]";
const inputClassName =
  "rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-[#14171f] placeholder:text-[#6d7587]";
const primaryButtonClassName =
  "rounded-full bg-[#14171f] px-4 py-2 text-sm font-medium text-white disabled:opacity-60";
const secondaryButtonClassName =
  "w-full rounded-full border border-black/10 bg-white px-4 py-2 text-sm text-[#14171f] transition hover:bg-[#f6f7fb]";

export function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
      callbackUrl: "/",
    });

    setLoading(false);

    if (!result || result.error) {
      setError("Invalid email or password.");
      return;
    }

    window.location.href = result.url ?? "/";
  }

  async function loginWithGithub() {
    await signIn("github", { callbackUrl: "/" });
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className={formClassName}>
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
          autoComplete="current-password"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className={primaryButtonClassName}
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <button
        type="button"
        onClick={loginWithGithub}
        className={secondaryButtonClassName}
      >
        Continue with GitHub
      </button>

      {error ? (
        <p className="text-sm text-red-600" role="status" aria-live="polite">
          {error}
        </p>
      ) : null}
    </div>
  );
}
