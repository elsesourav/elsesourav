"use client";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  dismissNotification,
  selectNotifications,
  type NotificationItem,
} from "@/store/slices/notificationsSlice";
import { createAppStore, type AppStore } from "@/store/store";
import CssBaseline from "@mui/material/CssBaseline";
import GlobalStyles from "@mui/material/GlobalStyles";
import { ThemeProvider, alpha, createTheme } from "@mui/material/styles";
import { useEffect, useMemo, useState } from "react";
import { Provider } from "react-redux";

type AppProvidersProps = {
  children: React.ReactNode;
};

type MuiPaletteSnapshot = {
  primaryMain: string;
  secondaryMain: string;
  backgroundDefault: string;
  backgroundPaper: string;
  textPrimary: string;
  textSecondary: string;
};

const muiColorRegex =
  /^(#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})|rgba?\([^)]+\)|hsla?\([^)]+\)|color\([^)]+\))$/;

const fallbackMuiPalette: Record<"light" | "dark", MuiPaletteSnapshot> = {
  light: {
    primaryMain: "#1f5ed4",
    secondaryMain: "#f59e0b",
    backgroundDefault: "#f4f6fb",
    backgroundPaper: "#ffffff",
    textPrimary: "#0f1420",
    textSecondary: "rgba(15,20,32,0.72)",
  },
  dark: {
    primaryMain: "#93c5fd",
    secondaryMain: "#38bdf8",
    backgroundDefault: "#0b1220",
    backgroundPaper: "#111827",
    textPrimary: "#e2e8f0",
    textSecondary: "rgba(226,232,240,0.78)",
  },
};

function isMuiColor(value: string): boolean {
  return muiColorRegex.test(value.trim());
}

function coerceMuiColor(value: string | undefined, fallback: string): string {
  if (!value) {
    return fallback;
  }

  const normalized = value.trim();
  return isMuiColor(normalized) ? normalized : fallback;
}

function resolveMuiPaletteFromCss(mode: "light" | "dark"): MuiPaletteSnapshot {
  const fallback = fallbackMuiPalette[mode];

  if (typeof window === "undefined") {
    return fallback;
  }

  const rootStyle = window.getComputedStyle(document.documentElement);

  const primaryMain = coerceMuiColor(
    rootStyle.getPropertyValue("--brand-secondary"),
    fallback.primaryMain,
  );
  const secondaryMain = coerceMuiColor(
    rootStyle.getPropertyValue("--brand-accent"),
    fallback.secondaryMain,
  );
  const backgroundDefault = coerceMuiColor(
    rootStyle.getPropertyValue("--background"),
    fallback.backgroundDefault,
  );
  const textPrimary = coerceMuiColor(
    rootStyle.getPropertyValue("--foreground"),
    fallback.textPrimary,
  );

  return {
    primaryMain,
    secondaryMain,
    backgroundDefault,
    backgroundPaper: fallback.backgroundPaper,
    textPrimary,
    textSecondary: coerceMuiColor(
      alpha(textPrimary, mode === "dark" ? 0.78 : 0.72),
      fallback.textSecondary,
    ),
  };
}

function resolveMuiModeFromDom(
  modeFromDom: string | undefined,
): "light" | "dark" {
  if (modeFromDom === "dark") {
    return "dark";
  }

  if (modeFromDom === "system" && typeof window !== "undefined") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  return "light";
}

function NotificationToast({ item }: { item: NotificationItem }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      dispatch(dismissNotification(item.id));
    }, item.durationMs);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [dispatch, item.durationMs, item.id]);

  const toneClassName =
    item.tone === "success"
      ? "border-emerald-300 bg-emerald-50 text-emerald-900"
      : item.tone === "error"
        ? "border-rose-300 bg-rose-50 text-rose-900"
        : "border-sky-300 bg-sky-50 text-sky-900";

  return (
    <article
      className={`pointer-events-auto rounded-xl border px-3 py-2 text-sm shadow-[0_14px_30px_-24px_rgba(20,23,31,0.65)] ${toneClassName}`}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="leading-6">{item.message}</p>
        <button
          type="button"
          onClick={() => dispatch(dismissNotification(item.id))}
          className="rounded-full border border-black/20 bg-white px-2 py-0.5 text-xs text-[#131924]"
          aria-label="Dismiss notification"
        >
          Dismiss
        </button>
      </div>
    </article>
  );
}

function NotificationViewport() {
  const items = useAppSelector(selectNotifications);

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-2">
      {items.map((item) => (
        <NotificationToast key={item.id} item={item} />
      ))}
    </div>
  );
}

export function AppProviders({ children }: AppProvidersProps) {
  const [store] = useState<AppStore>(() => createAppStore());
  const [mode, setMode] = useState<"light" | "dark">("light");
  const [muiPalette, setMuiPalette] = useState<MuiPaletteSnapshot>(
    fallbackMuiPalette.light,
  );

  useEffect(() => {
    const root = document.documentElement;
    const darkSchemeMediaQuery = window.matchMedia(
      "(prefers-color-scheme: dark)",
    );

    const refreshMuiTheme = () => {
      const resolvedMode = resolveMuiModeFromDom(root.dataset.themeMode);
      setMode(resolvedMode);
      setMuiPalette(resolveMuiPaletteFromCss(resolvedMode));
    };

    const observer = new MutationObserver(() => {
      refreshMuiTheme();
    });

    observer.observe(root, {
      attributes: true,
      attributeFilter: ["data-theme-mode"],
    });

    darkSchemeMediaQuery.addEventListener("change", refreshMuiTheme);
    refreshMuiTheme();

    return () => {
      observer.disconnect();
      darkSchemeMediaQuery.removeEventListener("change", refreshMuiTheme);
    };
  }, []);

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: muiPalette.primaryMain,
          },
          secondary: {
            main: muiPalette.secondaryMain,
          },
          background: {
            default: muiPalette.backgroundDefault,
            paper: muiPalette.backgroundPaper,
          },
          text: {
            primary: muiPalette.textPrimary,
            secondary: muiPalette.textSecondary,
          },
        },
        shape: {
          borderRadius: 12,
        },
        typography: {
          fontFamily:
            'var(--brand-font-sans), "Segoe UI", Helvetica, Arial, sans-serif',
        },
        components: {
          MuiPaper: {
            styleOverrides: {
              root: {
                backgroundImage: "none",
              },
            },
          },
          MuiButton: {
            defaultProps: {
              disableElevation: true,
            },
            styleOverrides: {
              root: {
                borderRadius: 999,
                textTransform: "none",
                fontWeight: 600,
              },
            },
          },
        },
      }),
    [mode, muiPalette],
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline enableColorScheme />
      <GlobalStyles
        styles={{
          a: {
            color: "var(--brand-secondary)",
            textUnderlineOffset: "2px",
          },
        }}
      />
      <Provider store={store}>
        {children}
        <NotificationViewport />
      </Provider>
    </ThemeProvider>
  );
}
