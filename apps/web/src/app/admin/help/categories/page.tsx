import { requireAdminContext } from "@/lib/page-access";
import { fetchServiceData } from "@/lib/service-client";
import { AdminHelpCategoriesClient } from "./client";

export const dynamic = "force-dynamic";

export default async function AdminHelpCategoriesPage() {
  const user = await requireAdminContext();
  const res = await fetchServiceData<any>({
    service: "content",
    path: "/v1/admin/content/help/categories",
    user,
  }).catch(() => []);

  const categories = Array.isArray(res) ? res : [];

  return (
    <div className="pt-4">
      <AdminHelpCategoriesClient initialCategories={categories} />
    </div>
  );
}
