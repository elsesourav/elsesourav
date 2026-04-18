"use client";

import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import CircularProgress from "@mui/material/CircularProgress";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import { useState } from "react";

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

  const handleModeChange = async (
    _event: React.MouseEvent<HTMLElement>,
    nextMode: ThemeMode | null,
  ) => {
    if (!nextMode || nextMode === mode || pending) {
      return;
    }

    const previous = mode;
    setMode(nextMode);
    setPending(true);
    setStatus(null);
    setError(null);

    if (typeof document !== "undefined") {
      document.documentElement.dataset.themeMode = nextMode;
    }

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
      if (typeof document !== "undefined") {
        document.documentElement.dataset.themeMode = previous;
      }
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
    <Card className="rounded-2xl border p-3">
      <CardTitle className="text-sm">Theme</CardTitle>
      <CardDescription className="mt-1 text-xs">
        Follow system or force light/dark mode.
      </CardDescription>

      <div className="mt-3">
        <ToggleButtonGroup
          value={mode}
          exclusive
          fullWidth
          size="small"
          onChange={handleModeChange}
          aria-label="Theme mode"
          disabled={pending}
        >
          <ToggleButton value="system" aria-label="System theme">
            System
          </ToggleButton>
          <ToggleButton value="light" aria-label="Light theme">
            Light
          </ToggleButton>
          <ToggleButton value="dark" aria-label="Dark theme">
            Dark
          </ToggleButton>
        </ToggleButtonGroup>
      </div>

      <div className="mt-2 flex min-h-5 items-center gap-2 text-xs">
        {pending ? <CircularProgress size={12} /> : null}
        {error ? <p className="text-rose-600">{error}</p> : null}
        {!error && status ? <p className="text-emerald-600">{status}</p> : null}
      </div>
    </Card>
  );
}
