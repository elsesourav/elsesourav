import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader, PageShell } from "@/components/ui/page";
import { fetchServiceData } from "@/lib/service-client";
import {
  formatPrice,
  type PublicApp,
  type PublicCategory,
} from "@/lib/view-models";
import Image from "next/image";
import Link from "next/link";

type AppsPageSearchParams = {
  search?: string;
  categoryId?: string;
};

export const dynamic = "force-dynamic";

function formatCompactCount(value?: number | null): string {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "0";
  }

  return new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function formatRating(value?: number | string | null): string {
  const numericValue = Number(value ?? 0);

  if (!Number.isFinite(numericValue)) {
    return "0.0";
  }

  return numericValue.toFixed(1);
}

function AppCatalogCard({ app }: { app: PublicApp }) {
  const media = app.media?.[0];
  const stats = app.aggregateStat;
  const tags = app.tags ?? [];

  return (
    <article className="overflow-hidden rounded-3xl border border-black/10 bg-white shadow-[0_18px_40px_-30px_rgba(20,23,31,0.55)] transition-transform duration-300 hover:-translate-y-1">
      <div className="relative aspect-16/10 bg-[linear-gradient(135deg,#eff4ff,#d8e5ff)]">
        {media ? (
          media.type === "VIDEO" ? (
            <video
              src={media.url}
              className="h-full w-full object-cover"
              muted
              playsInline
              autoPlay
              loop
              controls={false}
              preload="metadata"
            />
          ) : (
            <Image
              src={media.url}
              alt={media.alt ?? app.title}
              fill
              sizes="(max-width: 1024px) 100vw, 33vw"
              className="object-cover"
              unoptimized
            />
          )
        ) : app.iconUrl ? (
          <div className="flex h-full items-center justify-center p-8">
            <Image
              src={app.iconUrl}
              alt={`${app.title} icon`}
              width={144}
              height={144}
              className="h-24 w-24 rounded-3xl border border-black/10 bg-white object-cover shadow-sm"
              unoptimized
            />
          </div>
        ) : (
          <div className="flex h-full items-end bg-[linear-gradient(135deg,#123f8f,#1f5ed4_45%,#89aef7)] p-5 text-white">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-white/70">
                ElseSourav
              </p>
              <p className="mt-2 max-w-[18ch] text-2xl font-semibold leading-tight">
                {app.title}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-[#657086]">
              {app.category.name}
            </p>
            <h2 className="mt-1 text-lg font-semibold text-[#0f131d]">
              {app.title}
            </h2>
          </div>
          <span className="rounded-full bg-[#eef4ff] px-2.5 py-1 text-xs font-semibold text-[#1f5ed4]">
            {app.isPaid ? formatPrice(app.price) : "Free"}
          </span>
        </div>

        <p className="line-clamp-2 text-sm text-[#435064]">
          {app.shortDescription}
        </p>

        {app.developerName ? (
          <p className="text-xs text-[#657086]">By {app.developerName}</p>
        ) : null}

        <div className="flex flex-wrap gap-1.5">
          {tags.slice(0, 4).map((tag) => (
            <span
              key={tag.id}
              className="rounded-full border border-black/10 bg-[#f7f9fc] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#4a5262]"
            >
              {tag.name}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-2 text-xs text-[#526074]">
          <div className="rounded-xl bg-[#f7f9fc] px-2.5 py-2 text-center">
            <p className="font-semibold text-[#14171f]">
              {formatCompactCount(stats?.downloadCount ?? 0)}
            </p>
            <p>Downloads</p>
          </div>
          <div className="rounded-xl bg-[#f7f9fc] px-2.5 py-2 text-center">
            <p className="font-semibold text-[#14171f]">
              {formatCompactCount(stats?.viewCount ?? 0)}
            </p>
            <p>Views</p>
          </div>
          <div className="rounded-xl bg-[#f7f9fc] px-2.5 py-2 text-center">
            <p className="font-semibold text-[#14171f]">
              {formatRating(stats?.averageRating)}
            </p>
            <p>Rating</p>
          </div>
        </div>

        <Link
          href={`/apps/${app.slug}`}
          className="inline-flex rounded-full border border-black/15 bg-white px-4 py-2 text-sm font-semibold text-[#14171f] transition-colors hover:border-[#1f5ed4] hover:text-[#1f5ed4]"
        >
          Open details
        </Link>
      </div>
    </article>
  );
}

export default async function AppsPage({
  searchParams,
}: {
  searchParams?: Promise<AppsPageSearchParams>;
}) {
  const params = (await searchParams) ?? {};
  const search = typeof params.search === "string" ? params.search.trim() : "";
  const categoryId =
    typeof params.categoryId === "string" ? params.categoryId : undefined;

  const query = new URLSearchParams({
    page: "1",
    pageSize: "48",
  });

  if (search) {
    query.set("search", search);
  }

  if (categoryId) {
    query.set("categoryId", categoryId);
  }

  const [categories, appsResponse] = await Promise.all([
    fetchServiceData<PublicCategory[]>({
      service: "catalog",
      path: "/v1/catalog/categories",
    }),
    fetchServiceData<{ items: PublicApp[] }>({
      service: "catalog",
      path: `/v1/catalog/apps?${query.toString()}`,
    }),
  ]);

  const apps = appsResponse.items;

  return (
    <PageShell width="wide" className="gap-8 py-10">
      <section className="grid gap-4 rounded-4xl border border-black/10 bg-[linear-gradient(135deg,#0d1b3f,#1f5ed4_55%,#8fb1f7)] p-6 text-white shadow-[0_24px_60px_-34px_rgba(20,23,31,0.95)] sm:p-8 lg:grid-cols-[1.4fr_0.8fr] lg:items-end">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-white/70">
            Public catalog
          </p>
          <h1 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight sm:text-5xl sm:leading-[1.05]">
            Browse apps like a real marketplace, with media, tags, and live
            stats.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-white/82 sm:text-base">
            Search, filter, and open app detail pages from a denser catalog grid
            built for quick scanning on desktop and mobile.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
          <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
            <p className="text-xs uppercase tracking-[0.14em] text-white/70">
              Results
            </p>
            <p className="mt-2 text-2xl font-semibold">{apps.length}</p>
          </div>
          <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
            <p className="text-xs uppercase tracking-[0.14em] text-white/70">
              Categories
            </p>
            <p className="mt-2 text-2xl font-semibold">{categories.length}</p>
          </div>
          <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
            <p className="text-xs uppercase tracking-[0.14em] text-white/70">
              Live search
            </p>
            <p className="mt-2 text-2xl font-semibold">On</p>
          </div>
        </div>
      </section>

      <PageHeader
        eyebrow="Public Catalog"
        title="Apps"
        description="Search by title, filter by category, and open app details."
      />

      <form className="grid gap-3 rounded-3xl border border-black/10 bg-white p-4 shadow-[0_14px_30px_-24px_rgba(20,23,31,0.65)] sm:grid-cols-[2fr_1fr_auto] sm:items-end">
        <div className="grid gap-1.5">
          <Label htmlFor="apps-search">Search</Label>
          <Input
            id="apps-search"
            type="text"
            name="search"
            defaultValue={search}
            placeholder="Search by title or description"
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="apps-category">Category</Label>
          <select
            id="apps-category"
            name="categoryId"
            defaultValue={categoryId ?? ""}
            className="rounded-lg border border-black/20 bg-white px-3 py-2 text-sm text-[#14171f] focus-visible:border-[#1f5ed4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1f5ed4]/20"
          >
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <Button type="submit" className="rounded-lg">
          Filter results
        </Button>
      </form>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {apps.map((app) => (
          <AppCatalogCard key={app.id} app={app} />
        ))}
        {apps.length === 0 ? (
          <p className="text-sm text-[#4a5262]">
            No apps found for this filter.
          </p>
        ) : null}
      </section>
    </PageShell>
  );
}
