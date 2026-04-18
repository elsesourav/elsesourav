import { PageHeader } from "@/components/ui/page";
import { requireAdminContext } from "@/lib/page-access";
import { fetchServiceData } from "@/lib/service-client";
import type { AdminThemeConfig } from "@/lib/view-models";

import { AdminThemeConfigsClient } from "./client";

export const dynamic = "force-dynamic";

export default async function AdminThemeConfigsPage() {
  const user = await requireAdminContext();
  const configs = await fetchServiceData<AdminThemeConfig[]>({
    service: "theme",
    path: "/v1/admin/theme/configs",
    user,
  }).catch(() => []);

  const activeCount = configs.filter((item) => item.isActive).length;

  return (
    <div className="space-y-4 p-4 sm:p-5 lg:p-6">
      <PageHeader
        eyebrow="Presentation"
        title="Theme configs"
        description="Create, edit, and activate themes with live visual previews."
      />

      <section className="grid gap-3 sm:grid-cols-2">
        <article className="ui-card rounded-2xl border p-4">
          <p className="ui-text-muted text-xs uppercase tracking-wide">
            Configs
          </p>
          <p className="ui-text-heading mt-1 text-3xl font-semibold">
            {configs.length.toLocaleString()}
          </p>
        </article>
        <article className="ui-card rounded-2xl border p-4">
          <p className="ui-text-muted text-xs uppercase tracking-wide">
            Active
          </p>
          <p className="ui-text-heading mt-1 text-3xl font-semibold">
            {activeCount.toLocaleString()}
          </p>
        </article>
      </section>

      <AdminThemeConfigsClient initialConfigs={configs} />
    </div>
  );
}
