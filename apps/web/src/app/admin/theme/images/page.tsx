import { PageHeader } from "@/components/ui/page";
import { requireAdminContext } from "@/lib/page-access";
import { fetchServiceData } from "@/lib/service-client";
import type { AdminImageConfig } from "@/lib/view-models";

import { AdminImageConfigsClient } from "./client";

export const dynamic = "force-dynamic";

export default async function AdminImageConfigsPage() {
  const user = await requireAdminContext();
  const configs = await fetchServiceData<AdminImageConfig[]>({
    service: "theme",
    path: "/v1/admin/images/configs",
    user,
  }).catch(() => []);

  const activeCount = configs.filter((item) => item.isActive).length;

  return (
    <div className="space-y-4 p-4 sm:p-5 lg:p-6">
      <PageHeader
        eyebrow="Presentation"
        title="Image configs"
        description="Configure images for various site pages."
      />

      <AdminImageConfigsClient initialConfigs={configs} />
    </div>
  );
}
