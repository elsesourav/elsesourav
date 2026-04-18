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
    <div className="min-h-screen bg-[radial-gradient(900px_420px_at_8%_-10%,color-mix(in_srgb,var(--brand-secondary)_20%,transparent),transparent_62%),radial-gradient(760px_340px_at_92%_-8%,color-mix(in_srgb,var(--brand-accent)_18%,transparent),transparent_64%),var(--background)] ui-text-primary">
      <div className="mx-auto flex w-full max-w-[1400px] gap-4 p-3 sm:gap-5 sm:p-4 lg:h-screen lg:gap-6 lg:p-6">
        <aside className="ui-card flex w-full max-w-74 flex-col rounded-3xl border p-3 sm:p-4 lg:h-full lg:max-w-78">
          <div className="border-b ui-border pb-3">
            <Link
              href="/admin"
              className="inline-flex items-center rounded-full border ui-border bg-[color-mix(in_srgb,var(--background)_84%,var(--brand-secondary)_16%)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[color-mix(in_srgb,var(--brand-secondary)_88%,var(--foreground)_12%)]"
            >
              ElseSourav Admin
            </Link>
            <p className="ui-text-heading mt-2 truncate text-sm font-semibold">
              {admin.email ?? "admin@example.com"}
            </p>
            <p className="ui-text-muted text-xs">{admin.role} account</p>
          </div>

          <div className="mt-3 min-h-0 flex-1 overflow-auto pr-1">
            <AdminNav />
          </div>

          <div className="mt-3 space-y-3 border-t ui-border pt-3">
            <ThemeModeControl initialMode={settings.themeMode} />
            <SignOutButton />
          </div>
        </aside>

        <main className="ui-card min-h-[70vh] min-w-0 flex-1 rounded-3xl border p-3 sm:p-4 lg:h-full lg:overflow-auto lg:p-5">
          {children}
        </main>
      </div>
    </div>
  );
}
