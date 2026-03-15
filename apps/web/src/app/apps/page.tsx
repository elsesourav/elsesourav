import { PageHeader, PageShell } from "@/components/ui/page";
import { fetchServiceData } from "@/lib/service-client";
import {
  formatPrice,
  type PublicApp,
  type PublicCategory,
} from "@/lib/view-models";
import Link from "next/link";

type AppsPageSearchParams = {
  search?: string;
  categoryId?: string;
};

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
    <PageShell width="wide">
      <PageHeader
        eyebrow="Public Catalog"
        title="Apps"
        description="Search by title, filter by category, and open app details."
      />

      <form className="grid gap-3 rounded-xl border border-black/10 bg-white p-4 shadow-[0_14px_30px_-24px_rgba(20,23,31,0.65)] sm:grid-cols-[2fr_1fr_auto]">
        <input
          type="text"
          name="search"
          defaultValue={search}
          placeholder="Search by title or description"
          className="rounded-lg border border-black/20 bg-white px-3 py-2 text-sm text-[#14171f] placeholder:text-[#687181]"
        />
        <select
          name="categoryId"
          defaultValue={categoryId ?? ""}
          className="rounded-lg border border-black/20 bg-white px-3 py-2 text-sm text-[#14171f]"
        >
          <option value="">All categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-lg bg-[#14171f] px-4 py-2 text-sm font-medium text-white"
        >
          Filter
        </button>
      </form>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {apps.map((app) => (
          <article
            key={app.id}
            className="rounded-xl border border-black/10 bg-white p-4 shadow-[0_14px_30px_-24px_rgba(20,23,31,0.65)]"
          >
            <p className="text-xs uppercase tracking-wide text-[#4a5262]">
              {app.category.name}
            </p>
            <h2 className="mt-1 text-lg font-semibold text-[#0f131d]">
              {app.title}
            </h2>
            <p className="mt-2 text-sm text-[#3f4757]">
              {app.shortDescription}
            </p>
            <p className="mt-3 text-xs text-[#4a5262]">
              {app.isPaid ? formatPrice(app.price) : "Free"}
            </p>
            <Link
              href={`/apps/${app.slug}`}
              className="mt-4 inline-block rounded-lg border border-black/20 bg-white px-3 py-2 text-sm font-medium text-[#14171f] hover:bg-[#f7f8fb]"
            >
              Open details
            </Link>
          </article>
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
