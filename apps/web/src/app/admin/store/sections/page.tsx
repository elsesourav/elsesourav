import { PageHeader } from "@/components/ui/page";
import { requireAdminContext } from "@/lib/page-access";
import { fetchServiceData } from "@/lib/service-client";
import {
  type AdminAppListItem,
  type AdminSectionItem,
  type PaginatedResult,
} from "@/lib/view-models";

import { AdminSectionItemsClient } from "./client";

export const dynamic = "force-dynamic";

const emptySectionResult: PaginatedResult<AdminSectionItem> = {
  items: [],
  pagination: {
    page: 1,
    pageSize: 100,
    total: 0,
    totalPages: 1,
  },
};

export default async function AdminStoreSectionsPage() {
  const user = await requireAdminContext();
  const [result, apps] = await Promise.all([
    fetchServiceData<PaginatedResult<AdminSectionItem>>({
      service: "catalog",
      path: "/v1/admin/catalog/sections/items?page=1&pageSize=48",
      user,
    }).catch(() => emptySectionResult),
    fetchServiceData<AdminAppListItem[]>({
      service: "catalog",
      path: "/v1/admin/catalog/apps",
      user,
    }).catch(() => []),
  ]);

  const featuredCount = result.items.filter(
    (item) => item.sectionType === "FEATURED",
  ).length;
  const upcomingCount = result.items.filter(
    (item) => item.sectionType === "UPCOMING",
  ).length;

  return (
    <div className="space-y-4 p-4 sm:p-5 lg:p-6">
      <PageHeader
        eyebrow="Catalog"
        title="Store section items"
        description={`Showing ${result.pagination.total.toLocaleString()} records from section tables.`}
      />

      <section className="grid gap-3 sm:grid-cols-3">
        <article className="ui-card rounded-2xl border p-4">
          <p className="ui-text-muted text-xs uppercase tracking-wide">
            Total items
          </p>
          <p className="ui-text-heading mt-1 text-3xl font-semibold">
            {result.items.length.toLocaleString()}
          </p>
        </article>
        <article className="ui-card rounded-2xl border p-4">
          <p className="ui-text-muted text-xs uppercase tracking-wide">
            Featured
          </p>
          <p className="ui-text-heading mt-1 text-3xl font-semibold">
            {featuredCount.toLocaleString()}
          </p>
        </article>
        <article className="ui-card rounded-2xl border p-4">
          <p className="ui-text-muted text-xs uppercase tracking-wide">
            Upcoming
          </p>
          <p className="ui-text-heading mt-1 text-3xl font-semibold">
            {upcomingCount.toLocaleString()}
          </p>
        </article>
      </section>

      <AdminSectionItemsClient
        initialItems={result.items}
        appOptions={apps.map((item) => ({
          id: item.id,
          title: item.title,
          slug: item.slug,
        }))}
      />
    </div>
  );
}
