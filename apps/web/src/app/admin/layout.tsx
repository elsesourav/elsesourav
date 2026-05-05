import { SignOutButton } from "@/app/admin/sign-out-button";
import { ThemeModeControl } from "@/app/admin/theme-mode-control";
import { requireAdminContext } from "@/lib/page-access";
import { fetchServiceData } from "@/lib/service-client";
import Link from "next/link";
import type { ReactNode } from "react";
import { AdminNav } from "./nav";

type UserThemeSettingsResponse = {
  themeMode: "system" | "light" | "dark";
};

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const admin = await requireAdminContext();
  const settings = await fetchServiceData<UserThemeSettingsResponse>({
    service: "user",
    path: "/v1/user/settings",
    user: admin,
  }).catch(() => ({ themeMode: "system" as const }));

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex w-full gap-6 px-4 py-4 lg:h-screen lg:overflow-hidden">
        <aside className="flex w-full max-w-72 flex-col rounded-[28px] bg-[color-mix(in_srgb,var(--background)_96%,var(--foreground)_4%)] p-5 shadow-[0_20px_45px_-30px_rgba(15,18,28,0.25)] lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)]">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[color-mix(in_srgb,var(--brand-secondary)_14%,var(--background)_86%)] text-xs font-semibold text-[color-mix(in_srgb,var(--brand-secondary)_60%,var(--foreground)_40%)]">
              ES
            </span>
            <div>
              <p className="text-sm font-semibold tracking-tight text-[color-mix(in_srgb,var(--foreground)_88%,transparent)]">
                ElseSourav
              </p>
              <p className="text-xs uppercase tracking-[0.2em] text-[color-mix(in_srgb,var(--foreground)_45%,transparent)]">
                Admin
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-2xl bg-[color-mix(in_srgb,var(--background)_92%,var(--foreground)_8%)] p-3">
            <p className="truncate text-sm font-semibold text-[color-mix(in_srgb,var(--foreground)_88%,transparent)]">
              {admin.email ?? "admin@example.com"}
            </p>
            <p className="text-xs text-[color-mix(in_srgb,var(--foreground)_45%,transparent)]">
              {admin.role} account
            </p>
          </div>

          <div className="mt-4 min-h-0 flex-1 overflow-auto pr-1">
            <AdminNav />

            <div className="mt-6 space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[color-mix(in_srgb,var(--foreground)_45%,transparent)]">
                Teams
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 rounded-2xl px-3 py-2 text-[color-mix(in_srgb,var(--foreground)_60%,transparent)]">
                  <span className="h-2 w-2 rounded-full bg-[#f59e0b]" />
                  Marketing
                </div>
                <div className="flex items-center gap-2 rounded-2xl px-3 py-2 text-[color-mix(in_srgb,var(--foreground)_60%,transparent)]">
                  <span className="h-2 w-2 rounded-full bg-[#818cf8]" />
                  Development
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-3 border-t border-[color-mix(in_srgb,var(--foreground)_12%,transparent)] pt-4">
            <ThemeModeControl initialMode={settings.themeMode} />
            <div className="space-y-1">
              <Link
                href="/settings"
                className="flex items-center gap-3 rounded-2xl px-3 py-2 text-sm font-medium text-[color-mix(in_srgb,var(--foreground)_60%,transparent)] transition hover:bg-[color-mix(in_srgb,var(--background)_88%,var(--foreground)_12%)]"
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--background)_88%,var(--foreground)_12%)] text-[color-mix(in_srgb,var(--foreground)_55%,transparent)]">
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 0 1 0 2.8 2 2 0 0 1-2.8 0l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.6V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.2a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 0 1-2.8 0 2 2 0 0 1 0-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.6-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.2a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 0 1 0-2.8 2 2 0 0 1 2.8 0l.1.1a1.7 1.7 0 0 0 1.8.3 1.7 1.7 0 0 0 1-1.6V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.2a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 0 1 2.8 0 2 2 0 0 1 0 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8 1.7 1.7 0 0 0 1.6 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.2a1.7 1.7 0 0 0-1.6 1z" />
                  </svg>
                </span>
                Settings
              </Link>
              <SignOutButton />
            </div>
          </div>
        </aside>

        <main className="min-h-[70vh] min-w-0 flex-1 lg:h-[calc(100vh-2rem)] lg:overflow-y-auto">
          <div className="pb-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
