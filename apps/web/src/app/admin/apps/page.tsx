import { PageHeader, PageShell } from "@/components/ui/page";
import { requireAdminContext } from "@/lib/page-access";
import { fetchServiceData } from "@/lib/service-client";
import {
  formatDateTime,
  formatPrice,
  type AdminAppListItem,
} from "@/lib/view-models";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminAppsPage() {
  const user = await requireAdminContext();
  const apps = await fetchServiceData<AdminAppListItem[]>({
    service: "catalog",
    path: "/v1/admin/catalog/apps",
    user,
  }).catch(() => []);

  return (
    <PageShell width="wide" className="gap-6">
      <PageHeader
        eyebrow="Admin Data"
        title="Apps"
        description="Minimal view of database-backed app records."
      />

      <Link href="/admin" className="text-sm font-medium underline">
        Back to admin
      </Link>

      {apps.length === 0 ? (
        <p className="text-sm text-[#4a5262]">No app records found.</p>
      ) : (
        <section className="overflow-x-auto rounded-xl border border-black/15 bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-black/10 bg-[#f6f7fb] text-xs uppercase tracking-wide text-[#4a5262]">
              <tr>
                <th className="px-3 py-2">App</th>
                <th className="px-3 py-2">Category</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Price</th>
                <th className="px-3 py-2">Feedback</th>
                <th className="px-3 py-2">Downloads</th>
                <th className="px-3 py-2">Updated</th>
              </tr>
            </thead>
            <tbody>
              {apps.map((app) => (
                <tr
                  key={app.id}
                  className="border-b border-black/10 last:border-0"
                >
                  <td className="px-3 py-2">
                    <p className="font-medium text-[#111722]">{app.title}</p>
                    <p className="text-xs text-[#4a5262]">/{app.slug}</p>
                  </td>
                  <td className="px-3 py-2 text-[#364055]">
                    {app.category.name}
                  </td>
                  <td className="px-3 py-2 text-[#364055]">{app.status}</td>
                  <td className="px-3 py-2 text-[#364055]">
                    {app.isPaid ? formatPrice(app.price) : "Free"}
                  </td>
                  <td className="px-3 py-2 text-[#364055]">
                    {app._count.feedbacks}
                  </td>
                  <td className="px-3 py-2 text-[#364055]">
                    {app._count.downloadEvents}
                  </td>
                  <td className="px-3 py-2 text-[#364055]">
                    {formatDateTime(app.updatedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </PageShell>
  );
}
