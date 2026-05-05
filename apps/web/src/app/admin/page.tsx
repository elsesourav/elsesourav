import { requireAdminContext } from "@/lib/page-access";
import { fetchServiceData } from "@/lib/service-client";
import type { AuthStats, CatalogStats, UserStats } from "@/lib/view-models";
import Link from "next/link";

export const dynamic = "force-dynamic";

const quickRoutes = [
  {
    href: "/admin/apps",
    title: "Apps",
    summary: "Manage catalog app records.",
  },
  {
    href: "/admin/categories",
    title: "Categories",
    summary: "Organize and maintain taxonomy.",
  },
  {
    href: "/admin/users",
    title: "Users",
    summary: "Review roles and account status.",
  },
  {
    href: "/admin/feedback",
    title: "Feedback",
    summary: "Moderate incoming submissions.",
  },
  {
    href: "/admin/store/sections",
    title: "Store sections",
    summary: "Control storefront rail sections.",
  },
  {
    href: "/admin/store/banners",
    title: "Store banners",
    summary: "Schedule and place banners.",
  },
  {
    href: "/admin/content/pages",
    title: "Pages",
    summary: "Edit static content pages.",
  },
  {
    href: "/admin/content/blog",
    title: "Blog",
    summary: "Publish editorial updates.",
  },
  {
    href: "/admin/theme/configs",
    title: "Theme configs",
    summary: "Manage visual brand presets.",
  },
  {
    href: "/admin/control",
    title: "API docs",
    summary: "Open service references.",
  },
] as const;

function toneForStatus(status: string): string {
  const normalized = status.toUpperCase();

  if (normalized.includes("PUBLISH") || normalized.includes("ACTIVE")) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (normalized.includes("DRAFT") || normalized.includes("PENDING")) {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  if (normalized.includes("ARCHIVE") || normalized.includes("DELETE")) {
    return "border-rose-200 bg-rose-50 text-rose-700";
  }

  return "border-[color-mix(in_srgb,var(--foreground)_12%,transparent)] bg-[color-mix(in_srgb,var(--background)_90%,var(--foreground)_10%)] text-[color-mix(in_srgb,var(--foreground)_55%,transparent)]";
}

export default async function AdminPage() {
  const user = await requireAdminContext();
  const displayName = user.email?.split("@")[0] ?? "Admin";

  const [catalogStats, authStats, userStats] = await Promise.all([
    fetchServiceData<CatalogStats>({
      service: "catalog",
      path: "/v1/admin/catalog/stats",
      user,
    }).catch(() => ({
      appsCount: 0,
      categoriesCount: 0,
      recentApps: [],
    })),
    fetchServiceData<AuthStats>({
      service: "auth",
      path: "/v1/auth/admin/stats",
      user,
    }).catch(() => ({
      usersCount: 0,
    })),
    fetchServiceData<UserStats>({
      service: "user",
      path: "/v1/admin/user/stats",
      user,
    }).catch(() => ({
      feedbackCount: 0,
    })),
  ]);

  const topCards = [
    {
      label: "Catalog apps",
      value: catalogStats.appsCount,
      detail: "Current app entities",
    },
    {
      label: "Total users",
      value: authStats.usersCount,
      detail: "Registered accounts",
    },
    {
      label: "Feedback entries",
      value: userStats.feedbackCount,
      detail: "Moderation queue size",
    },
  ] as const;

  return (
    <div className="space-y-8 py-2 sm:py-4">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color-mix(in_srgb,var(--foreground)_45%,transparent)]">
          Admin
        </p>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl font-semibold text-[color-mix(in_srgb,var(--foreground)_90%,transparent)]">
            Analytics
          </h1>
        </div>
        <p className="max-w-2xl text-sm text-[color-mix(in_srgb,var(--foreground)_55%,transparent)]">
          Monitor apps, users, content, and support flows in one place.
        </p>
      </header>

      <section className="flex flex-wrap items-center gap-3">
        <span className="rounded-full bg-[color-mix(in_srgb,var(--background)_94%,var(--foreground)_6%)] px-4 py-2 text-xs font-semibold text-[color-mix(in_srgb,var(--foreground)_65%,transparent)] shadow-sm">
          Full statistics
        </span>
        <span className="rounded-full bg-[color-mix(in_srgb,var(--background)_90%,var(--foreground)_10%)] px-4 py-2 text-xs font-semibold text-[color-mix(in_srgb,var(--foreground)_45%,transparent)]">
          Results summary
        </span>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-3xl bg-[color-mix(in_srgb,var(--background)_96%,var(--foreground)_4%)] p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color-mix(in_srgb,var(--foreground)_45%,transparent)]">
            Team Payments
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-[color-mix(in_srgb,var(--foreground)_90%,transparent)]">
            Hello, {displayName}
          </h2>
          <p className="mt-2 text-sm text-[color-mix(in_srgb,var(--foreground)_55%,transparent)]">
            Use the sidebar to move between sections and keep operations tidy.
          </p>
        </div>
        <div className="rounded-3xl bg-[color-mix(in_srgb,var(--background)_96%,var(--foreground)_4%)] p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color-mix(in_srgb,var(--foreground)_45%,transparent)]">
            Account Snapshot
          </p>
          <p className="mt-2 text-sm font-semibold text-[color-mix(in_srgb,var(--foreground)_90%,transparent)]">
            Email
          </p>
          <p className="text-xs text-[color-mix(in_srgb,var(--foreground)_55%,transparent)]">
            {user.email ?? "Unknown"}
          </p>
          <p className="mt-3 text-sm font-semibold text-[color-mix(in_srgb,var(--foreground)_90%,transparent)]">
            Role
          </p>
          <p className="text-xs text-[color-mix(in_srgb,var(--foreground)_55%,transparent)]">
            {user.role}
          </p>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {topCards.map((card) => (
          <div
            key={card.label}
            className="rounded-3xl bg-[color-mix(in_srgb,var(--background)_96%,var(--foreground)_4%)] p-5 shadow-sm"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[color-mix(in_srgb,var(--foreground)_45%,transparent)]">
              {card.label}
            </p>
            <p className="mt-2 text-3xl font-semibold text-[color-mix(in_srgb,var(--foreground)_90%,transparent)]">
              {card.value.toLocaleString()}
            </p>
            <p className="mt-2 text-xs text-[color-mix(in_srgb,var(--foreground)_55%,transparent)]">
              {card.detail}
            </p>
          </div>
        ))}
      </section>

      <section className="rounded-3xl bg-[color-mix(in_srgb,var(--background)_96%,var(--foreground)_4%)] p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-[color-mix(in_srgb,var(--foreground)_90%,transparent)]">
          Recent apps
        </h2>
        <div className="mt-4 grid gap-3">
          {catalogStats.recentApps.length === 0 ? (
            <p className="rounded-xl border border-[color-mix(in_srgb,var(--foreground)_12%,transparent)] px-3 py-2 text-sm text-[color-mix(in_srgb,var(--foreground)_55%,transparent)]">
              No recent apps available.
            </p>
          ) : null}
          {catalogStats.recentApps.map((app) => (
            <div
              key={app.id}
              className="flex items-start justify-between gap-3 rounded-2xl border border-[color-mix(in_srgb,var(--foreground)_12%,transparent)] px-3 py-2"
            >
              <div>
                <p className="font-semibold text-[color-mix(in_srgb,var(--foreground)_90%,transparent)]">
                  {app.title}
                </p>
                <p className="text-xs text-[color-mix(in_srgb,var(--foreground)_55%,transparent)]">
                  /{app.slug}
                </p>
              </div>
              <span
                className={`rounded-full border px-2 py-1 text-[11px] font-semibold ${toneForStatus(app.status)}`}
              >
                {app.status}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl bg-[color-mix(in_srgb,var(--background)_96%,var(--foreground)_4%)] p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-[color-mix(in_srgb,var(--foreground)_90%,transparent)]">
          Quick routes
        </h2>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {quickRoutes.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-2xl border border-[color-mix(in_srgb,var(--foreground)_12%,transparent)] px-3 py-2.5 text-sm transition hover:border-[color-mix(in_srgb,var(--foreground)_18%,transparent)] hover:bg-[color-mix(in_srgb,var(--background)_90%,var(--foreground)_10%)]"
            >
              <p className="font-semibold text-[color-mix(in_srgb,var(--foreground)_90%,transparent)]">
                {item.title}
              </p>
              <p className="text-xs text-[color-mix(in_srgb,var(--foreground)_55%,transparent)]">
                {item.summary}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
