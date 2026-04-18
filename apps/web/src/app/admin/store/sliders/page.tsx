import { PageHeader } from "@/components/ui/page";
import { requireAdminContext } from "@/lib/page-access";
import { fetchServiceData } from "@/lib/service-client";
import { type AdminAppListItem, type AdminSlider } from "@/lib/view-models";
import { AdminSlidersClient } from "./client";

export const dynamic = "force-dynamic";

export default async function AdminStoreSlidersPage() {
  const user = await requireAdminContext();
  const [sliders, apps] = await Promise.all([
    fetchServiceData<AdminSlider[]>({
      service: "catalog",
      path: "/v1/admin/catalog/sliders?includeInactive=true",
      user,
    }).catch(() => []),
    fetchServiceData<AdminAppListItem[]>({
      service: "catalog",
      path: "/v1/admin/catalog/apps",
      user,
    }).catch(() => []),
  ]);

  return (
    <div className="space-y-4 p-4 sm:p-5 lg:p-6">
      <PageHeader
        eyebrow="Catalog"
        title="Home sliders"
        description="Create, edit, and disable storefront sliders that drive the homepage hero and featured rails."
      />

      <AdminSlidersClient
        initialSliders={sliders}
        appOptions={apps.map((item) => ({
          id: item.id,
          title: item.title,
          slug: item.slug,
          status: item.status,
        }))}
      />
    </div>
  );
}
