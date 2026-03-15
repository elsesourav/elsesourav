import { PageHeader, PageShell } from "@/components/ui/page";
import { requireAdminContext } from "@/lib/page-access";
import { fetchServiceData } from "@/lib/service-client";
import { formatDateTime, type AdminContentPage } from "@/lib/view-models";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminContentPagesPage() {
  const user = await requireAdminContext();
  const pages = await fetchServiceData<AdminContentPage[]>({
    service: "content",
    path: "/v1/admin/content/pages",
    user,
  }).catch(() => []);

  return (
    <PageShell width="wide" className="gap-6">
      <PageHeader
        eyebrow="Admin Data"
        title="Content Pages"
        description="CMS pages and latest revision information."
      />

      <Link href="/admin" className="text-sm font-medium underline">
        Back to admin
      </Link>

      {pages.length === 0 ? (
        <p className="text-sm text-[#4a5262]">No content page records found.</p>
      ) : (
        <section className="overflow-x-auto rounded-xl border border-black/15 bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-black/10 bg-[#f6f7fb] text-xs uppercase tracking-wide text-[#4a5262]">
              <tr>
                <th className="px-3 py-2">Title</th>
                <th className="px-3 py-2">Slug</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Latest Version</th>
                <th className="px-3 py-2">Published</th>
                <th className="px-3 py-2">Updated</th>
              </tr>
            </thead>
            <tbody>
              {pages.map((page) => {
                const latestVersion = page.versions[0]?.version ?? "-";

                return (
                  <tr
                    key={page.id}
                    className="border-b border-black/10 last:border-0"
                  >
                    <td className="px-3 py-2 font-medium text-[#111722]">
                      {page.title}
                    </td>
                    <td className="px-3 py-2 text-[#364055]">/{page.slug}</td>
                    <td className="px-3 py-2 text-[#364055]">{page.status}</td>
                    <td className="px-3 py-2 text-[#364055]">
                      {latestVersion}
                    </td>
                    <td className="px-3 py-2 text-[#364055]">
                      {formatDateTime(page.publishedAt)}
                    </td>
                    <td className="px-3 py-2 text-[#364055]">
                      {formatDateTime(page.updatedAt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      )}
    </PageShell>
  );
}
