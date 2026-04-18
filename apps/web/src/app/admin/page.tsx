import { PageHeader } from "@/components/ui/page";
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

  return "ui-border ui-surface-soft ui-text-muted";
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
    <div className="space-y-5 p-2 sm:p-3 lg:p-4">
      <PageHeader
        eyebrow="Admin"
        title="Control center"
        description="Clean operational view for apps, users, content, and support flows."
      />

      <section className="grid gap-3 lg:grid-cols-[1.35fr_1fr]">
        <article className="rounded-2xl border ui-border bg-[linear-gradient(140deg,color-mix(in_srgb,var(--brand-primary)_86%,black_14%),color-mix(in_srgb,var(--brand-secondary)_88%,black_12%))] p-4 text-white shadow-[0_16px_34px_-24px_rgba(20,23,31,0.9)]">
          <p className="text-xs uppercase tracking-[0.14em] text-blue-100">
            Welcome
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">
            Hello, {displayName}
          </h2>
          <p className="mt-2 text-sm text-blue-100">
            Use the sidebar to move between sections and keep operations tidy.
          </p>
        </article>

        <article className="ui-card rounded-2xl border p-4">
          <p className="ui-text-muted text-xs uppercase tracking-[0.12em]">
            Account
          </p>
          <p className="ui-text-heading mt-2 text-sm font-medium">Email</p>
          <p className="ui-text-muted truncate text-xs">
            {user.email ?? "Unknown"}
          </p>
          <p className="ui-text-heading mt-3 text-sm font-medium">Role</p>
          <p className="ui-text-muted text-xs">{user.role}</p>
        </article>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        {topCards.map((card) => (
          <article
            key={card.label}
            className="ui-card relative flex min-h-32 flex-col overflow-hidden rounded-2xl border p-4"
          >
            <p className="ui-text-muted relative text-xs uppercase tracking-[0.11em]">
              {card.label}
            </p>
            <p className="ui-text-heading relative mt-2 text-3xl font-semibold">
              {card.value.toLocaleString()}
            </p>
            <p className="ui-text-muted relative mt-2 text-xs">{card.detail}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-3 lg:grid-cols-[1.25fr_1fr]">
        <article className="ui-card rounded-2xl border p-4">
          <h2 className="ui-text-heading text-lg font-semibold">Recent apps</h2>
          <div className="mt-3 grid gap-2">
            {catalogStats.recentApps.length === 0 ? (
              <p className="ui-surface-soft ui-border rounded-xl border px-3 py-2 text-sm ui-text-muted">
                No recent apps available.
              </p>
            ) : null}
            {catalogStats.recentApps.map((app) => (
              <article
                key={app.id}
                className="ui-border flex items-start justify-between gap-3 rounded-xl border bg-[color-mix(in_srgb,var(--background)_95%,white_5%)] px-3 py-2"
              >
                <div>
                  <p className="ui-text-heading font-semibold">{app.title}</p>
                  <p className="ui-text-muted text-xs">/{app.slug}</p>
                </div>
                <span
                  className={`rounded-full border px-2 py-1 text-[11px] font-semibold ${toneForStatus(app.status)}`}
                >
                  {app.status}
                </span>
              </article>
            ))}
          </div>
        </article>

        <article className="ui-card rounded-2xl border p-4">
          <h2 className="ui-text-heading text-lg font-semibold">
            Quick routes
          </h2>
          <div className="mt-3 grid gap-2">
            {quickRoutes.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="ui-border block rounded-xl border bg-[color-mix(in_srgb,var(--background)_95%,white_5%)] px-3 py-2.5 hover:ui-border-strong hover:bg-[color-mix(in_srgb,var(--background)_86%,var(--brand-secondary)_14%)]"
              >
                <p className="ui-text-heading text-sm font-semibold">
                  {item.title}
                </p>
                <p className="ui-text-muted text-xs">{item.summary}</p>
              </Link>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
