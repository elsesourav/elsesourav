import { PageHeader } from "@/components/ui/page";
import { requireAdminContext } from "@/lib/page-access";
import { fetchServiceData } from "@/lib/service-client";
import type {
  AdminAppListItem,
  AdminAppTag,
  AdminCategory,
} from "@/lib/view-models";

import { AdminAppsClient } from "./client";

export const dynamic = "force-dynamic";

export default async function AdminAppsPage() {
  const user = await requireAdminContext();
  const [apps, categories, tags] = await Promise.all([
    fetchServiceData<AdminAppListItem[]>({
      service: "catalog",
      path: "/v1/admin/catalog/apps",
      user,
    }).catch(() => []),
    fetchServiceData<AdminCategory[]>({
      service: "catalog",
      path: "/v1/admin/catalog/categories",
      user,
    }).catch(() => []),
    fetchServiceData<AdminAppTag[]>({
      service: "catalog",
      path: "/v1/admin/catalog/tags",
      user,
    }).catch(() => []),
  ]);

  const paidApps = apps.filter((app) => app.isPaid).length;
  const publishedApps = apps.filter((app) =>
    app.status.toUpperCase().includes("PUBLISH"),
  ).length;

  return (
    <div className="space-y-4 p-4 sm:p-5 lg:p-6">
      <PageHeader
        eyebrow="Catalog"
        title="Apps"
        description="Operational view of catalog app records, status, pricing, and engagement totals."
      />

      <section className="grid gap-3 sm:grid-cols-3">
        <article className="ui-card rounded-2xl border p-4">
          <p className="ui-text-muted text-xs uppercase tracking-wide">
            Total apps
          </p>
          <p className="ui-text-heading mt-1 text-3xl font-semibold">
            {apps.length.toLocaleString()}
          </p>
        </article>
        <article className="ui-card rounded-2xl border p-4">
          <p className="ui-text-muted text-xs uppercase tracking-wide">
            Published
          </p>
          <p className="ui-text-heading mt-1 text-3xl font-semibold">
            {publishedApps.toLocaleString()}
          </p>
        </article>
        <article className="ui-card rounded-2xl border p-4">
          <p className="ui-text-muted text-xs uppercase tracking-wide">
            Paid apps
          </p>
          <p className="ui-text-heading mt-1 text-3xl font-semibold">
            {paidApps.toLocaleString()}
          </p>
        </article>
      </section>

      <AdminAppsClient
        initialApps={apps}
        initialTags={tags.map((tag) => ({
          id: tag.id,
          name: tag.name,
          slug: tag.slug,
          _count: tag._count,
        }))}
        categoryOptions={categories
          .filter(
            (item) =>
              item.deletedAt === null && item.scheduledDeletionAt === null,
          )
          .map((item) => ({
            id: item.id,
            name: item.name,
          }))}
      />
    </div>
  );
}
