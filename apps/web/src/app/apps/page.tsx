import { AppsBannerSlider } from "@/app/apps/apps-banner-slider";
import AppCatalogCard from "@/components/apps/AppCatalogCard";
import CategoryShowcase, {
  type CategoryShowcaseData,
} from "@/components/apps/CategoryShowcase";
import type { HomeBanner } from "@/components/home";
import { PageShell } from "@/components/ui/page";
import { fetchServiceData } from "@/lib/service-client";
import type { PublicApp } from "@/lib/view-models";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type AppsPageSearchParams = {
  search?: string;
  categoryId?: string;
  type?: string;
};

type TopAppsResponse = {
  apps: CategoryShowcaseData["apps"];
};

export const dynamic = "force-dynamic";

/* ------------------------------------------------------------------ */
/*  Section divider                                                    */
/* ------------------------------------------------------------------ */

function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-4 pt-4">
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[color-mix(in_srgb,var(--brand-primary)_20%,transparent)] to-transparent" />
      <span className="rounded-full border ui-border bg-[color-mix(in_srgb,var(--background)_90%,white_10%)] px-4 py-1 text-[10px] font-bold uppercase tracking-[0.22em] ui-text-muted">
        {label}
      </span>
      <div className="h-px flex-1 bg-gradient-to-l from-transparent via-[color-mix(in_srgb,var(--brand-primary)_20%,transparent)] to-transparent" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default async function AppsPage({
  searchParams,
}: {
  searchParams?: Promise<AppsPageSearchParams>;
}) {
  const params = (await searchParams) ?? {};
  const search = typeof params.search === "string" ? params.search.trim() : "";
  const categoryId =
    typeof params.categoryId === "string" ? params.categoryId : undefined;
  const typeFilter =
    typeof params.type === "string" ? params.type : undefined;

  const showSearch =
    Boolean(search) || Boolean(categoryId) || Boolean(typeFilter);

  /* ---- Build filter query for the apps list ---- */
  const appsQuery = new URLSearchParams({ limit: "24" });
  if (search) appsQuery.set("search", search);
  if (categoryId) appsQuery.set("categoryId", categoryId);
  if (typeFilter) appsQuery.set("type", typeFilter);

  /* ---- Parallel fetch ---- */
  const [banners, topAppsRes, typePreviewRes, categoryPreviewRes, appsResponse] =
    await Promise.all([
      /* Banners */
      fetchServiceData<HomeBanner[]>({
        service: "catalog",
        path: "/v1/catalog/banners",
      }).catch(() => []),

      /* Top apps — always loaded, hidden when searching */
      showSearch
        ? Promise.resolve({ apps: [] as CategoryShowcaseData["apps"] })
        : fetchServiceData<TopAppsResponse>({
            service: "catalog",
            path: "/v1/catalog/top-apps?limit=10",
          }).catch(() => ({ apps: [] as CategoryShowcaseData["apps"] })),

      /* Type-grouped carousels */
      showSearch
        ? Promise.resolve({ types: [] as CategoryShowcaseData[] })
        : fetchServiceData<{ types: CategoryShowcaseData[] }>({
            service: "catalog",
            path: "/v1/catalog/type-previews?appsPerType=6",
          }).catch(() => ({ types: [] as CategoryShowcaseData[] })),

      /* Category-grouped carousels */
      showSearch
        ? Promise.resolve({ categories: [] as CategoryShowcaseData[] })
        : fetchServiceData<{ categories: CategoryShowcaseData[] }>({
            service: "catalog",
            path: "/v1/catalog/category-previews?categoryLimit=8&appsPerCategory=6",
          }).catch(() => ({ categories: [] as CategoryShowcaseData[] })),

      /* Search/filter results */
      showSearch
        ? fetchServiceData<{ items: PublicApp[] }>({
            service: "catalog",
            path: `/v1/catalog/apps?${appsQuery.toString()}`,
          }).catch(() => ({ items: [] as PublicApp[] }))
        : Promise.resolve({ items: [] as PublicApp[] }),
    ]);

  const apps = appsResponse.items;
  const topApps = topAppsRes.apps ?? [];
  const typePreviews = typePreviewRes.types ?? [];
  const categoryPreviews = categoryPreviewRes.categories ?? [];

  /* ---- Top apps as a showcase-compatible object ---- */
  const topAppsShowcase: CategoryShowcaseData = {
    id: "__top__",
    name: "Top Apps",
    description: "Highest-rated and most-downloaded across all categories.",
    apps: topApps,
  };

  return (
    <PageShell width="wide" className="gap-8 py-10">
      {/* Banner slider */}
      <AppsBannerSlider banners={banners} />

      {showSearch ? (
        /* ---- Search / filter results grid ---- */
        <section>
          <p className="mb-4 text-sm ui-text-muted">
            {apps.length === 0
              ? "No apps found for this filter."
              : `Showing ${apps.length} app${apps.length === 1 ? "" : "s"}`}
          </p>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {apps.map((app) => (
              <AppCatalogCard key={app.id} app={app} />
            ))}
          </div>
        </section>
      ) : (
        <div className="space-y-12">
          {/* ── 1. Top Apps ─────────────────────────────── */}
          {topApps.length > 0 && (
            <section className="space-y-6">
              <SectionDivider label="Top Picks" />
              <CategoryShowcase
                category={topAppsShowcase}
                showMoreHref="/apps?sort=topRated"
              />
            </section>
          )}

          {/* ── 2. By App Type ──────────────────────────── */}
          {typePreviews.length > 0 && (
            <section className="space-y-10">
              <SectionDivider label="Browse by Type" />
              {typePreviews.map((group) => (
                <CategoryShowcase
                  key={group.type ?? group.name}
                  category={group}
                  showMoreHref={`/apps?type=${group.type}`}
                />
              ))}
            </section>
          )}

          {/* ── 3. By Category ──────────────────────────── */}
          {categoryPreviews.length > 0 && (
            <section className="space-y-10">
              <SectionDivider label="Browse by Category" />
              {categoryPreviews.map((cat) => (
                <CategoryShowcase
                  key={cat.id ?? cat.name}
                  category={cat}
                  showMoreHref={
                    cat.id ? `/apps?categoryId=${cat.id}` : "/apps"
                  }
                />
              ))}
            </section>
          )}
        </div>
      )}
    </PageShell>
  );
}
