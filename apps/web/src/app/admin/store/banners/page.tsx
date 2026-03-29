import { PageHeader } from "@/components/ui/page";
import { requireAdminContext } from "@/lib/page-access";
import { fetchServiceData } from "@/lib/service-client";
import type { AdminBanner } from "@/lib/view-models";
import { AdminBannersClient } from "./client";

export const dynamic = "force-dynamic";

export default async function AdminStoreBannersPage() {
  const user = await requireAdminContext();
  const banners = await fetchServiceData<AdminBanner[]>({
    service: "catalog",
    path: "/v1/admin/catalog/banners",
    user,
  }).catch(() => []);

  return (
    <div className="space-y-4 p-4 sm:p-5 lg:p-6">
      <PageHeader
        eyebrow="Catalog"
        title="Store banners"
        description="Create, edit, disable, and preview campaign banners exactly as they appear on storefront surfaces."
      />

      <AdminBannersClient initialBanners={banners} />
    </div>
  );
}
