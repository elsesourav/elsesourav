import { PageHeader } from "@/components/ui/page";
import { requireAdminContext } from "@/lib/page-access";
import { fetchServiceData } from "@/lib/service-client";
import type { AdminCategory } from "@/lib/view-models";
import { AdminCategoriesClient } from "./client";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const user = await requireAdminContext();
  const categories = await fetchServiceData<AdminCategory[]>({
    service: "catalog",
    path: "/v1/admin/catalog/categories",
    user,
  }).catch(() => []);

  const pendingDeletionCount = categories.filter(
    (item) => item.scheduledDeletionAt !== null && item.deletedAt === null,
  ).length;
  const deletedCount = categories.filter(
    (item) => item.deletedAt !== null,
  ).length;
  const activeCount = categories.length - pendingDeletionCount - deletedCount;

  return (
    <div className="space-y-4 p-4 sm:p-5 lg:p-6">
      <PageHeader
        eyebrow="Catalog"
        title="Categories"
        description="Create categories, schedule delayed deletion, and restore pending records."
      />

      <section className="grid gap-3 sm:grid-cols-3">
        <article className="ui-card rounded-2xl border p-4">
          <p className="ui-text-muted text-xs uppercase tracking-wide">
            Active
          </p>
          <p className="ui-text-heading mt-1 text-3xl font-semibold">
            {activeCount.toLocaleString()}
          </p>
        </article>
        <article className="ui-card rounded-2xl border p-4">
          <p className="ui-text-muted text-xs uppercase tracking-wide">
            Pending deletion
          </p>
          <p className="ui-text-heading mt-1 text-3xl font-semibold">
            {pendingDeletionCount.toLocaleString()}
          </p>
        </article>
        <article className="ui-card rounded-2xl border p-4">
          <p className="ui-text-muted text-xs uppercase tracking-wide">
            Deleted
          </p>
          <p className="ui-text-heading mt-1 text-3xl font-semibold">
            {deletedCount.toLocaleString()}
          </p>
        </article>
      </section>

      <AdminCategoriesClient initialCategories={categories} />
    </div>
  );
}
