"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/cn";
import { Sun, Moon, Monitor } from "lucide-react";

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
      setTimeout(() => setStatus(null), 2000);
    } catch (requestError) {
      setMode(previous);
      setTheme(previous);
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Failed to update theme mode.",
      );
      setTimeout(() => setError(null), 3000);
    } finally {
      setPending(false);
    }
  };

  return (
    <section>
      <div className="flex items-center justify-between px-2 mb-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
          Theme
        </p>
        <div className="min-h-5 text-[10px] font-medium flex items-center">
          {pending && <span className="text-text-muted">Saving...</span>}
          {error && <span className="text-status-danger">{error}</span>}
          {!error && status && <span className="text-status-success">{status}</span>}
        </div>
      </div>

      <div className="relative flex rounded-lg bg-surface-active p-1 shadow-inner">
        {(
          [
            { value: "system", label: "System", icon: Monitor },
            { value: "light", label: "Light", icon: Sun },
            { value: "dark", label: "Dark", icon: Moon },
          ] as const
        ).map(({ value, label, icon: Icon }) => {
          const active = (mounted ? mode : initialMode) === value;

          return (
            <button
              key={value}
              type="button"
              onClick={() => applyModeChange(value)}
              disabled={pending}
              className={cn(
                "relative z-10 flex flex-1 items-center justify-center gap-2 rounded-md py-1.5 text-xs font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-brand-accent",
                active ? "text-brand-primary-foreground" : "text-text-secondary hover:text-text-primary"
              )}
            >
              {active && (
                <motion.div
                  layoutId="theme-active"
                  className="absolute inset-0 rounded-md bg-brand-primary shadow-sm"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  style={{ zIndex: -1 }}
                />
              )}
              <Icon className="h-3 w-3" />
              <span className="sr-only sm:not-sr-only sm:inline">{label}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
