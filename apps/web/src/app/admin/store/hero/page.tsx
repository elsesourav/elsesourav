import { PageHeader } from "@/components/ui/page";
import { requireAdminContext } from "@/lib/page-access";
import { fetchServiceData } from "@/lib/service-client";
import type { AdminImageConfig } from "@/lib/view-models";

import { AdminHomeHeroClient } from "./client";

export const dynamic = "force-dynamic";

export default async function AdminHomeHeroPage() {
  const user = await requireAdminContext();

  const configs = await fetchServiceData<AdminImageConfig[]>({
    service: "theme",
    path: "/v1/admin/theme/images/section/HOME_HERO",
    user,
  }).catch(() => []);

  return (
    <div className="space-y-4 p-4 sm:p-5 lg:p-6">
      <PageHeader
        eyebrow="Homepage"
        title="Hero Section Config"
        description="Manage the dynamic WebGL Hero background and title text for the homepage."
      />
      <AdminHomeHeroClient initialConfigs={configs} />
    </div>
  );
}
