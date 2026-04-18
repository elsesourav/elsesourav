import { auth } from "@/auth";
import { PublicSiteShell } from "@/components/layout/public-site-shell";
import { MuiEmotionCacheProvider } from "@/components/providers/mui-emotion-cache-provider";
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

const siteUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "ElseSourav Apps",
    template: "%s | ElseSourav Apps",
  },
  icons: {
    icon: [{ url: "/img/icon.png" }],
    shortcut: [{ url: "/img/icon.png" }],
    apple: [{ url: "/img/icon.png" }],
  },
  description:
    "Discover curated apps, reviews, changelogs, and developer resources on the ElseSourav platform.",
  applicationName: "ElseSourav Apps",
  openGraph: {
    type: "website",
    siteName: "ElseSourav Apps",
    title: "ElseSourav Apps",
    description:
      "Discover curated apps, reviews, changelogs, and developer resources on the ElseSourav platform.",
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "ElseSourav Apps",
    description:
      "Discover curated apps, reviews, changelogs, and developer resources on the ElseSourav platform.",
  },
};

type UserThemeSettingsResponse = {
  themeMode: "system" | "light" | "dark";
  customTheme: Record<string, string> | null;
};

type ShellSessionUser = {
  id: string;
  role: "ADMIN" | "USER";
  name: string | null;
  email: string | null;
};

async function getThemeRuntimeData(): Promise<{
  activeTheme: ThemeConfigDto | null;
  settings: ThemeSettingsPayload | null;
  sessionUser: ShellSessionUser | null;
}> {
  const [activeTheme, session] = await Promise.all([
    fetchServiceData<ThemeConfigDto>({
      service: "theme",
      path: "/v1/theme/active",
    }).catch(() => null),
    auth(),
  ]);

  const sessionUser: ShellSessionUser | null = session?.user?.id
    ? {
        id: session.user.id,
        role: session.user.role,
        name: session.user.name ?? null,
        email: session.user.email ?? null,
      }
    : null;

  if (!session?.user?.id) {
    return {
      activeTheme,
      settings: null,
      sessionUser,
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
    sessionUser,
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { activeTheme, settings, sessionUser } = await getThemeRuntimeData();
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
        <MuiEmotionCacheProvider>
          <AppProviders>
            <PublicSiteShell sessionUser={sessionUser}>
              {children}
            </PublicSiteShell>
          </AppProviders>
        </MuiEmotionCacheProvider>
      </body>
    </html>
  );
}
