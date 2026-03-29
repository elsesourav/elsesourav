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
    summary: "Review app states, pricing, and engagement counts.",
  },
  {
    href: "/admin/categories",
    title: "Categories",
    summary: "Create categories and manage delayed deletion lifecycle.",
  },
  {
    href: "/admin/users",
    title: "Users",
    summary: "Inspect role distribution and account activity signals.",
  },
  {
    href: "/admin/feedback",
    title: "Feedback",
    summary: "Moderate user submissions and monitor quality trends.",
  },
  {
    href: "/admin/store/sections",
    title: "Store sections",
    summary: "Curate latest/upcoming/featured release windows.",
  },
  {
    href: "/admin/store/banners",
    title: "Store banners",
    summary: "Control campaign placement and schedule windows.",
  },
  {
    href: "/admin/content/pages",
    title: "Content pages",
    summary: "Manage dynamic CMS content and publish revisions.",
  },
  {
    href: "/admin/content/blog",
    title: "Blog posts",
    summary: "Draft, preview, and publish editorial posts.",
  },
  {
    href: "/admin/theme/configs",
    title: "Theme configs",
    summary: "Tune visual presets and currently active palette.",
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

  return "border-black/15 bg-[#f6f8fc] text-[#3f4757]";
}

export default async function AdminPage() {
  const user = await requireAdminContext();

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

  const activityTotal =
    catalogStats.appsCount + authStats.usersCount + userStats.feedbackCount;

  const topCards = [
    {
      label: "Catalog apps",
      value: catalogStats.appsCount,
      accent: "from-[#1f5ed4]/20 to-[#1f5ed4]/0",
      detail: "Visible app entities in catalog-service.",
    },
    {
      label: "Total users",
      value: authStats.usersCount,
      accent: "from-emerald-400/20 to-emerald-400/0",
      detail: "Accounts available for platform access.",
    },
    {
      label: "Feedback entries",
      value: userStats.feedbackCount,
      accent: "from-orange-400/20 to-orange-400/0",
      detail: "Messages waiting for moderation context.",
    },
    {
      label: "Categories",
      value: catalogStats.categoriesCount,
      accent: "from-violet-400/20 to-violet-400/0",
      detail: "Categories currently available for assignment.",
    },
  ] as const;

  return (
    <div className="space-y-5 p-4 sm:p-5 lg:p-6">
      <PageHeader
        eyebrow="Command Deck"
        title="Platform control center"
        description="Centralized overview for catalog, users, feedback, and content operations."
      />

      <section className="grid gap-3 sm:grid-cols-[1.25fr_1fr]">
        <article className="rounded-2xl border border-black/10 bg-[linear-gradient(140deg,#18284a,#1f5ed4)] p-4 text-white shadow-[0_16px_34px_-24px_rgba(20,23,31,0.9)]">
          <p className="text-xs uppercase tracking-[0.12em] text-blue-100">
            Operations summary
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">
            {activityTotal.toLocaleString()} tracked entities
          </h2>
          <p className="mt-2 text-sm text-blue-100">
            Combined app, user, and feedback totals for a quick system pulse.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/admin/control"
              className="rounded-full border border-white/35 bg-white/15 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/25"
            >
              Open microservice controls
            </Link>
            <Link
              href="/admin/categories"
              className="rounded-full border border-white/35 bg-white/15 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/25"
            >
              Manage categories
            </Link>
          </div>
        </article>

        <article className="rounded-2xl border border-black/10 bg-[#f8fbff] p-4">
          <p className="text-xs uppercase tracking-[0.12em] text-[#5b6781]">
            Operator context
          </p>
          <p className="mt-2 text-sm font-medium text-[#1a2235]">User ID</p>
          <p className="truncate text-xs text-[#5b6781]">{user.id}</p>
          <p className="mt-3 text-sm font-medium text-[#1a2235]">Role</p>
          <p className="text-xs text-[#5b6781]">{user.role}</p>
          <p className="mt-3 text-sm font-medium text-[#1a2235]">Email</p>
          <p className="truncate text-xs text-[#5b6781]">
            {user.email ?? "Unknown"}
          </p>
        </article>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {topCards.map((card) => (
          <article
            key={card.label}
            className="relative flex min-h-44 flex-col overflow-hidden rounded-2xl border border-black/10 bg-white p-4"
          >
            <div
              className={`pointer-events-none absolute inset-x-0 top-0 h-14 bg-linear-to-b ${card.accent}`}
            />
            <p className="relative text-xs uppercase tracking-[0.11em] text-[#56617a]">
              {card.label}
            </p>
            <p className="relative mt-2 text-3xl font-semibold text-[#0f1524]">
              {card.value.toLocaleString()}
            </p>
            <p className="relative mt-2 text-xs text-[#5a647d]">
              {card.detail}
            </p>
          </article>
        ))}
      </section>

      <section className="grid gap-3 lg:grid-cols-[1.2fr_1fr]">
        <article className="rounded-2xl border border-black/10 bg-white p-4">
          <h2 className="text-lg font-semibold text-[#151c2d]">Recent apps</h2>
          <p className="mt-1 text-xs text-[#5a647d]">
            Latest entities created in the catalog service.
          </p>
          <div className="mt-3 grid gap-2">
            {catalogStats.recentApps.length === 0 ? (
              <p className="rounded-xl border border-black/10 bg-[#f8f9fc] px-3 py-2 text-sm text-[#5a647d]">
                No recent apps available.
              </p>
            ) : null}
            {catalogStats.recentApps.map((app) => (
              <article
                key={app.id}
                className="flex items-start justify-between gap-3 rounded-xl border border-black/10 bg-[#fbfcff] px-3 py-2"
              >
                <div>
                  <p className="font-semibold text-[#141c2d]">{app.title}</p>
                  <p className="text-xs text-[#5b6680]">/{app.slug}</p>
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

        <article className="rounded-2xl border border-black/10 bg-white p-4">
          <h2 className="text-lg font-semibold text-[#151c2d]">Quick routes</h2>
          <p className="mt-1 text-xs text-[#5a647d]">
            Jump straight to operational screens.
          </p>
          <div className="mt-3 grid gap-2">
            {quickRoutes.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-xl border border-black/10 bg-[#fcfdff] px-3 py-2.5 hover:border-black/20 hover:bg-white"
              >
                <p className="text-sm font-semibold text-[#172032]">
                  {item.title}
                </p>
                <p className="text-xs text-[#5a647d]">{item.summary}</p>
              </Link>
            ))}
          </div>
        </article>
      </section>

      <section className="rounded-2xl border border-black/10 bg-[#f7f9ff] p-4">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-[#1f5ed4]">
          Operational notes
        </h2>
        <p className="mt-2 text-sm text-[#44506a]">
          Category deletions are delayed with a restore window. If a category
          has active apps, schedule delete is blocked until those apps are
          removed.
        </p>
      </section>
    </div>
  );
}
