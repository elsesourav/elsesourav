import { PageHeader, PageShell } from "@/components/ui/page";
import { requireAdminContext } from "@/lib/page-access";
import { fetchServiceData } from "@/lib/service-client";
import type { AdminCategory } from "@/lib/view-models";
import Link from "next/link";
import { AdminCategoriesClient } from "./client";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const user = await requireAdminContext();
  const categories = await fetchServiceData<AdminCategory[]>({
    service: "catalog",
    path: "/v1/admin/catalog/categories",
    user,
  }).catch(() => []);

  return (
    <PageShell width="wide" className="gap-6">
      <PageHeader
        eyebrow="Admin Data"
        title="Categories"
        description="Database categories with app counts."
      />

      <Link href="/admin" className="text-sm font-medium underline">
        Back to admin
      </Link>

      <AdminCategoriesClient initialCategories={categories} />
    </PageShell>
  );
}
