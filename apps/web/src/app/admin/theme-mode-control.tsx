"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

type ThemeMode = "system" | "light" | "dark";

type ThemeModeControlProps = {
  initialMode: ThemeMode;
};

type ApiResponse = {
  ok: boolean;
  error?: {
    message?: string;
  };
};

export function ThemeModeControl({ initialMode }: ThemeModeControlProps) {
  const [mode, setMode] = useState<ThemeMode>(initialMode);
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !theme) {
      return;
    }

    if (theme === "system" || theme === "light" || theme === "dark") {
      setMode(theme);
    }
  }, [mounted, theme]);

  const applyModeChange = async (nextMode: ThemeMode) => {
    if (nextMode === mode || pending) {
      return;
    }

    const previous = mode;
    setMode(nextMode);
    setPending(true);
    setStatus(null);
    setError(null);

    setTheme(nextMode);

    try {
      const response = await fetch("/api/user/settings", {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ themeMode: nextMode }),
      });

      const payload = (await response.json()) as ApiResponse;

      if (!response.ok || !payload.ok) {
        throw new Error(
          payload.error?.message ?? "Failed to update theme mode.",
        );
      }

      setStatus("Theme updated");
    } catch (requestError) {
      setMode(previous);
      setTheme(previous);
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Failed to update theme mode.",
      );
    } finally {
      setPending(false);
    }
  };

  return (
    <section>
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[color-mix(in_srgb,var(--foreground)_45%,transparent)]">
        Theme
      </p>
      <p className="mt-1 text-xs text-[color-mix(in_srgb,var(--foreground)_55%,transparent)]">
        Follow system or force light/dark mode.
      </p>

      <div className="mt-3 grid grid-cols-3 rounded-full bg-[color-mix(in_srgb,var(--background)_88%,var(--foreground)_12%)] p-1 shadow-sm">
        {(
          [
            ["system", "System"],
            ["light", "Light"],
            ["dark", "Dark"],
          ] as const
        ).map(([value, label]) => {
          const active = (mounted ? mode : initialMode) === value;

          return (
            <button
              key={value}
              type="button"
              onClick={() => applyModeChange(value)}
              disabled={pending}
              className={[
                "rounded-full px-3 py-1.5 text-xs font-semibold transition",
                active
                  ? "bg-[color-mix(in_srgb,var(--foreground)_85%,transparent)] text-background"
                  : "text-[color-mix(in_srgb,var(--foreground)_55%,transparent)] hover:bg-[color-mix(in_srgb,var(--background)_82%,var(--foreground)_18%)]",
              ].join(" ")}
            >
              {label}
            </button>
          );
        })}
      </div>

      <div className="mt-2 min-h-5 text-xs">
        {pending ? (
          <p className="text-[color-mix(in_srgb,var(--foreground)_45%,transparent)]">
            Saving...
          </p>
        ) : null}
        {error ? <p className="text-rose-600">{error}</p> : null}
        {!error && status ? <p className="text-emerald-600">{status}</p> : null}
      </div>
    </section>
  );
}
