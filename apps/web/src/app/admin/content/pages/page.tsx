import { PageHeader } from "@/components/ui/page";
import { requireAdminContext } from "@/lib/page-access";
import { fetchServiceData } from "@/lib/service-client";
import type { AdminContentPage } from "@/lib/view-models";

import { AdminContentPagesClient } from "./client";

export const dynamic = "force-dynamic";

export default async function AdminContentPagesPage() {
  const user = await requireAdminContext();
  const pages = await fetchServiceData<AdminContentPage[]>({
    service: "content",
    path: "/v1/admin/content/pages",
    user,
  }).catch(() => []);

  const publishedCount = pages.filter(
    (page) => page.publishedAt !== null,
  ).length;

  return (
    <div className="space-y-4 p-4 sm:p-5 lg:p-6">
      <PageHeader
        eyebrow="Presentation"
        title="Content pages"
        description="Create and edit CMS records with publication status and SEO controls."
      />

      <section className="grid gap-3 sm:grid-cols-2">
        <article className="ui-card rounded-2xl border p-4">
          <p className="ui-text-muted text-xs uppercase tracking-wide">
            Total pages
          </p>
          <p className="ui-text-heading mt-1 text-3xl font-semibold">
            {pages.length.toLocaleString()}
          </p>
        </article>
        <article className="ui-card rounded-2xl border p-4">
          <p className="ui-text-muted text-xs uppercase tracking-wide">
            Published
          </p>
          <p className="ui-text-heading mt-1 text-3xl font-semibold">
            {publishedCount.toLocaleString()}
          </p>
        </article>
      </section>

      <AdminContentPagesClient initialPages={pages} />
    </div>
  );
}
