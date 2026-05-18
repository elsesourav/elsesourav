import { AppsBannerSlider } from "@/app/apps/apps-banner-slider";
import AppCatalogCard from "@/components/apps/AppCatalogCard";
import { PageShell } from "@/components/ui/page";
import { fetchServiceData } from "@/lib/service-client";
import type { PublicApp, PublicCategory } from "@/lib/view-models";
import Link from "next/link";

export const dynamic = "force-dynamic";

type CategoryPageSearchParams = {
  cursor?: string;
};

type AppsResponse = {
  items: PublicApp[];
  pagination: {
    limit: number;
    nextCursor: string | null;
    hasMore: boolean;
  };
};

export default async function CategoryAppsPage({
  params,
  searchParams,
}: {
  params: Promise<{ categoryId: string }>;
  searchParams?: Promise<CategoryPageSearchParams>;
}) {
  const { categoryId } = await params;
  const queryParams = (await searchParams) ?? {};
  const cursor =
    typeof queryParams.cursor === "string" ? queryParams.cursor : undefined;

  const query = new URLSearchParams({
    limit: "24",
    categoryId,
  });

  if (cursor) {
    query.set("cursor", cursor);
  }

  const [categories, appsResponse] = await Promise.all([
    fetchServiceData<PublicCategory[]>({
      service: "catalog",
      path: "/v1/catalog/categories",
    }),
    fetchServiceData<AppsResponse>({
      service: "catalog",
      path: `/v1/catalog/apps?${query.toString()}`,
    }),
  ]);

  const category = categories.find((item) => item.id === categoryId);

  return (
    <PageShell width="wide" className="gap-8 py-10">
      <AppsBannerSlider banners={[]} />
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#76819a]">
              Category
            </p>
            <h1 className="text-3xl font-semibold text-[#0f131d]">
              {category?.name ?? "Category"}
            </h1>
          </div>
          <Link
            href="/apps"
            className="inline-flex items-center rounded-full border border-black/15 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#14171f] transition hover:border-[#1f5ed4] hover:text-[#1f5ed4]"
          >
            All apps
          </Link>
        </div>

        {appsResponse.items.length === 0 ? (
          <p className="text-sm text-[#4a5262]">
            No apps found for this category.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {appsResponse.items.map((app) => (
              <AppCatalogCard key={app.id} app={app} />
            ))}
          </div>
        )}

        {appsResponse.pagination.hasMore &&
        appsResponse.pagination.nextCursor ? (
          <Link
            href={`/apps/category/${categoryId}?cursor=${appsResponse.pagination.nextCursor}`}
            className="inline-flex items-center rounded-full border border-black/15 bg-white px-5 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#14171f] transition hover:border-[#1f5ed4] hover:text-[#1f5ed4]"
          >
            Show more
          </Link>
        ) : null}
      </section>
    </PageShell>
  );
}
