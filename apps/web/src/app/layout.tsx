import type { ApiResponse, ThemeConfigDto } from "@elsesourav/types";
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

async function getActiveTheme(): Promise<ThemeConfigDto | null> {
  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

  try {
    const response = await fetch(`${baseUrl}/api/theme/active`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as ApiResponse<ThemeConfigDto>;
    if (!payload.ok) {
      return null;
    }

    return payload.data;
  } catch {
    return null;
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const activeTheme = await getActiveTheme();

  const themeVariables: Record<string, string> = {
    "--background": activeTheme?.backgroundColor ?? "#ffffff",
    "--foreground": activeTheme?.foregroundColor ?? "#171717",
    "--brand-primary": activeTheme?.primaryColor ?? "#1f2937",
    "--brand-secondary": activeTheme?.secondaryColor ?? "#111827",
    "--brand-accent": activeTheme?.accentColor ?? "#f59e0b",
    "--brand-font-sans": activeTheme?.fontSans ?? "Inter",
    "--brand-font-heading": activeTheme?.fontHeading ?? "Poppins",
    "--brand-heading-scale": activeTheme?.headingScale ?? "1",
  };

  return (
    <html lang="en" style={themeVariables}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
