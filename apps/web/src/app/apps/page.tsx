import { AppsBannerSlider } from "@/app/apps/apps-banner-slider";
import AppGridCard, {
  type AppGridCardData,
} from "@/components/apps/AppGridCard";
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
  sort?: string;
};

type TopAppsResponse = {
  apps: CategoryShowcaseData["apps"];
};

/* ------------------------------------------------------------------ */
/*  Human-readable labels for AppType enum values                      */
/* ------------------------------------------------------------------ */

const TYPE_LABELS: Record<string, string> = {
  GAMING: "Gaming",
  SOCIAL_MEDIA_COMMUNICATION: "Social & Communication",
  PRODUCTIVITY_BUSINESS: "Productivity & Business",
  LIFESTYLE: "Lifestyle",
  UTILITY_TOOL: "Utilities & Tools",
};

/* ------------------------------------------------------------------ */
/*  Section divider                                                    */
/* ------------------------------------------------------------------ */

function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-4 pt-4">
      <div className="h-px flex-1 bg-linear-to-r from-transparent via-[color-mix(in_srgb,var(--brand-primary)_20%,transparent)] to-transparent" />
      <span className="rounded-full border ui-border bg-[color-mix(in_srgb,var(--background)_90%,white_10%)] px-4 py-1 text-[10px] font-bold uppercase tracking-[0.22em] ui-text-muted">
        {label}
      </span>
      <div className="h-px flex-1 bg-linear-to-l from-transparent via-[color-mix(in_srgb,var(--brand-primary)_20%,transparent)] to-transparent" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Filter header                                                      */
/* ------------------------------------------------------------------ */

function FilterHeader({
  label,
  count,
  backHref,
}: {
  label: string;
  count: number;
  backHref?: string;
}) {
  return (
    <div className="flex flex-col gap-3 pb-2">
      {backHref && (
        <a
          href={backHref}
          className="flex w-fit items-center gap-1.5 text-xs ui-text-muted transition-colors hover:ui-text-primary"
        >
          <svg
            className="h-3.5 w-3.5"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 19.5L8.25 12l7.5-7.5"
            />
          </svg>
          All Apps
        </a>
      )}
      <div>
        <h1 className="text-2xl font-bold ui-text-heading">{label}</h1>
        <p className="mt-1 text-sm ui-text-muted">
          {count > 0
            ? `${count} app${count === 1 ? "" : "s"} found`
            : "No apps found for this filter"}
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export const dynamic = "force-dynamic";

export default async function AppsPage({
  searchParams,
}: {
  searchParams?: Promise<AppsPageSearchParams>;
}) {
  const params = (await searchParams) ?? {};
  const search = typeof params.search === "string" ? params.search.trim() : "";
  const categoryId =
    typeof params.categoryId === "string" ? params.categoryId : undefined;
  const typeFilter = typeof params.type === "string" ? params.type : undefined;
  const sortFilter = typeof params.sort === "string" ? params.sort : undefined;

  const showSearch =
    Boolean(search) ||
    Boolean(categoryId) ||
    Boolean(typeFilter) ||
    Boolean(sortFilter);

  /* ---- Build query for the apps list ---- */
  const appsQuery = new URLSearchParams({ limit: "24" });
  if (search) appsQuery.set("search", search);
  if (categoryId) appsQuery.set("categoryId", categoryId);
  if (typeFilter) appsQuery.set("type", typeFilter);
  if (sortFilter) appsQuery.set("sort", sortFilter);

  /* ---- Parallel fetch ---- */
  const [
    banners,
    topAppsRes,
    typePreviewRes,
    categoryPreviewRes,
    appsResponse,
    categoriesRes,
  ] = await Promise.all([
    /* Banners */
    fetchServiceData<HomeBanner[]>({
      service: "catalog",
      path: "/v1/catalog/banners",
    }).catch(() => []),

    /* Top apps */
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

    /* Categories list — needed to resolve categoryId → name */
    categoryId
      ? fetchServiceData<Array<{ id: string; name: string }>>({
          service: "catalog",
          path: "/v1/catalog/categories",
        }).catch(() => [] as Array<{ id: string; name: string }>)
      : Promise.resolve([] as Array<{ id: string; name: string }>),
  ]);

  const apps = appsResponse.items;
  const topApps = topAppsRes.apps ?? [];
  const typePreviews = typePreviewRes.types ?? [];
  const categoryPreviews = categoryPreviewRes.categories ?? [];

  /* ---- Derive a human-readable filter label ---- */
  let filterLabel = "App Catalog";
  if (search) filterLabel = `Results for "${search}"`;
  else if (typeFilter) filterLabel = TYPE_LABELS[typeFilter] ?? typeFilter;
  else if (categoryId) {
    const matchedCat = categoriesRes.find((c) => c.id === categoryId);
    filterLabel = matchedCat?.name ?? "Category";
  } else if (sortFilter === "topRated") filterLabel = "Top Rated Apps";
  else if (sortFilter === "popular") filterLabel = "Most Popular Apps";
  else if (sortFilter === "latest") filterLabel = "Latest Apps";

  /* ---- Top apps as a showcase-compatible object ---- */
  const topAppsShowcase: CategoryShowcaseData = {
    id: "__top__",
    name: "Top Apps",
    description: "Highest-rated and most-downloaded across all categories.",
    apps: topApps,
  };

  /* ---- Map PublicApp → AppGridCardData ---- */
  function toGridCardData(app: PublicApp): AppGridCardData {
    const heroMedia = app.media?.[0];
    return {
      id: app.id,
      title: app.title,
      slug: app.slug,
      shortDescription: app.shortDescription,
      iconUrl: app.iconUrl,
      featureGraphicUrl: heroMedia?.thumbnailUrl ?? heroMedia?.url ?? null,
      developerName: app.developerName,
      averageRating: app.aggregateStat?.averageRating ?? null,
      isPaid: app.isPaid,
      price: app.price,
      appCategory: app.appCategory,
      type: app.type,
    };
  }

  return (
    <PageShell width="wide" className="gap-8 py-10">
      {/* Banner slider — only on homepage view */}
      {!showSearch && <AppsBannerSlider banners={banners} />}

      {showSearch ? (
        /* ── Filter / search results ─────────────────────────── */
        <section className="space-y-6">
          <FilterHeader
            label={filterLabel}
            count={apps.length}
            backHref="/apps"
          />

          {apps.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {apps.map((app) => (
                <AppGridCard key={app.id} app={toGridCardData(app)} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 py-20 text-center">
              <svg
                className="h-12 w-12 ui-text-muted opacity-40"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0015.803 15.803z"
                />
              </svg>
              <p className="text-sm ui-text-muted">
                No apps matched this filter.
              </p>
              <a
                href="/apps"
                className="mt-2 rounded-full border ui-border px-5 py-2 text-xs font-semibold ui-text-primary transition-colors hover:border-[color-mix(in_srgb,var(--brand-secondary)_45%,transparent)]"
              >
                Browse all apps
              </a>
            </div>
          )}
        </section>
      ) : (
        /* ── Homepage carousels ──────────────────────────────── */
        <div className="space-y-12">
          {/* 1. Top Apps */}
          {topApps.length > 0 && (
            <section className="space-y-6">
              <SectionDivider label="Top Picks" />
              <CategoryShowcase
                category={topAppsShowcase}
                showMoreHref="/apps?sort=topRated"
              />
            </section>
          )}

          {/* 2. By App Type */}
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

          {/* 3. By Category */}
          {categoryPreviews.length > 0 && (
            <section className="space-y-10">
              <SectionDivider label="Browse by Category" />
              {categoryPreviews.map((cat) => (
                <CategoryShowcase
                  key={cat.id ?? cat.name}
                  category={cat}
                  showMoreHref={cat.id ? `/apps?categoryId=${cat.id}` : "/apps"}
                />
              ))}
            </section>
          )}
        </div>
      )}
    </PageShell>
  );
}
