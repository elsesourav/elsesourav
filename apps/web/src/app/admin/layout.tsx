import { SignOutButton } from "@/app/admin/sign-out-button";
import { ThemeModeControl } from "@/app/admin/theme-mode-control";
import { requireAdminContext } from "@/lib/page-access";
import { fetchServiceData } from "@/lib/service-client";
import Link from "next/link";
import type { ReactNode } from "react";
import { AdminNav } from "./nav";
import { Search, Bell, Settings } from "lucide-react";

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
    <div className="min-h-screen bg-bg-surface text-text-primary flex">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 flex flex-col border-r border-border-subtle bg-bg-base sticky top-0 h-screen overflow-y-auto hidden md:flex">
        <div className="p-4 flex items-center gap-3">
          <div className="h-8 w-8 rounded-md bg-brand-primary text-brand-primary-foreground flex items-center justify-center font-bold text-sm">
            E
          </div>
          <span className="font-semibold tracking-tight text-text-primary">
            ElseSourav
          </span>
        </div>

        <div className="px-4 py-2">
          <div className="flex items-center gap-3 rounded-md border border-border-subtle p-2 shadow-sm bg-bg-surface">
            <div className="h-8 w-8 rounded-full bg-surface-active flex items-center justify-center text-xs font-medium">
              {admin.email?.[0].toUpperCase() ?? "A"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium text-text-primary">
                {admin.email ?? "admin@example.com"}
              </p>
              <p className="text-xs text-text-muted truncate">
                {admin.role}
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 py-4 px-2">
          <AdminNav />
        </div>

        <div className="p-4 border-t border-border-subtle space-y-2">
          <ThemeModeControl initialMode={settings.themeMode} />
          <Link
            href="/settings"
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-text-secondary hover:bg-surface-hover hover:text-text-primary transition-colors"
          >
            <Settings className="h-4 w-4" />
            Settings
          </Link>
          <SignOutButton />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-bg-surface">
        {/* Topbar */}
        <header className="h-14 flex items-center justify-between px-6 border-b border-border-subtle bg-bg-base sticky top-0 z-10 hidden md:flex">
          <div className="flex items-center gap-4 text-text-muted">
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-border-subtle bg-bg-surface text-sm hover:bg-surface-hover transition-colors">
              <Search className="h-4 w-4" />
              <span className="text-xs">Search...</span>
              <kbd className="ml-2 hidden sm:inline-flex px-1.5 py-0.5 rounded text-[10px] bg-bg-base border border-border-subtle font-sans">
                ⌘K
              </kbd>
            </button>
          </div>
          <div className="flex items-center gap-3">
            <button className="h-8 w-8 rounded-md hover:bg-surface-hover flex items-center justify-center text-text-muted transition-colors">
              <Bell className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-6 lg:p-8 overflow-y-auto">
          <div className="mx-auto max-w-6xl">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
