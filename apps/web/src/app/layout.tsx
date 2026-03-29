import { auth } from "@/auth";
import { fetchServiceData } from "@/lib/service-client";
import {
  buildThemeVariables,
  type ThemeSettingsPayload,
} from "@/lib/theme-runtime";
import type { ThemeConfigDto } from "@elsesourav/types";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppProviders } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ElseSourav Developer Platform",
  description:
    "Developer portfolio, mini app store, and admin control platform.",
};

type UserThemeSettingsResponse = {
  themeMode: "system" | "light" | "dark";
  customTheme: Record<string, string> | null;
};

async function getThemeRuntimeData(): Promise<{
  activeTheme: ThemeConfigDto | null;
  settings: ThemeSettingsPayload | null;
}> {
  const [activeTheme, session] = await Promise.all([
    fetchServiceData<ThemeConfigDto>({
      service: "theme",
      path: "/v1/theme/active",
    }).catch(() => null),
    auth(),
  ]);

  if (!session?.user?.id) {
    return {
      activeTheme,
      settings: null,
    };
  }

  const settings = await fetchServiceData<UserThemeSettingsResponse>({
    service: "user",
    path: "/v1/user/settings",
    user: {
      id: session.user.id,
      role: session.user.role,
    },
  })
    .then((payload) => ({
      themeMode: payload.themeMode,
      customTheme: payload.customTheme,
    }))
    .catch(() => null);

  return {
    activeTheme,
    settings,
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { activeTheme, settings } = await getThemeRuntimeData();
  const themeRuntime = buildThemeVariables({
    activeTheme,
    settings,
  });

  return (
    <html
      lang="en"
      data-theme-mode={themeRuntime.mode}
      style={themeRuntime.variables}
    >
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
