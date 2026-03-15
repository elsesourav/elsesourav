import { PageHeader, PageShell } from "@/components/ui/page";
import { requireAdminContext } from "@/lib/page-access";
import { fetchServiceData } from "@/lib/service-client";
import {
  formatDateTime,
  type AdminSectionItem,
  type PaginatedResult,
} from "@/lib/view-models";
import Link from "next/link";

export const dynamic = "force-dynamic";

const emptySectionResult: PaginatedResult<AdminSectionItem> = {
  items: [],
  pagination: {
    page: 1,
    pageSize: 100,
    total: 0,
    totalPages: 1,
  },
};

export default async function AdminStoreSectionsPage() {
  const user = await requireAdminContext();
  const result = await fetchServiceData<PaginatedResult<AdminSectionItem>>({
    service: "catalog",
    path: "/v1/admin/catalog/sections/items?page=1&pageSize=100",
    user,
  }).catch(() => emptySectionResult);

  return (
    <PageShell width="wide" className="gap-6">
      <PageHeader
        eyebrow="Admin Data"
        title="Store Section Items"
        description={`Showing ${result.pagination.total} records from section tables.`}
      />

      <Link href="/admin" className="text-sm font-medium underline">
        Back to admin
      </Link>

      {result.items.length === 0 ? (
        <p className="text-sm text-[#4a5262]">No section items found.</p>
      ) : (
        <section className="overflow-x-auto rounded-xl border border-black/15 bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-black/10 bg-[#f6f7fb] text-xs uppercase tracking-wide text-[#4a5262]">
              <tr>
                <th className="px-3 py-2">App</th>
                <th className="px-3 py-2">Section</th>
                <th className="px-3 py-2">Order</th>
                <th className="px-3 py-2">Release</th>
                <th className="px-3 py-2">Starts</th>
                <th className="px-3 py-2">Ends</th>
              </tr>
            </thead>
            <tbody>
              {result.items.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-black/10 last:border-0"
                >
                  <td className="px-3 py-2">
                    <p className="font-medium text-[#111722]">
                      {item.app.title}
                    </p>
                    <p className="text-xs text-[#4a5262]">/{item.app.slug}</p>
                  </td>
                  <td className="px-3 py-2 text-[#364055]">
                    {item.sectionType}
                  </td>
                  <td className="px-3 py-2 text-[#364055]">
                    {item.orderIndex}
                  </td>
                  <td className="px-3 py-2 text-[#364055]">
                    {formatDateTime(item.releaseAt)}
                  </td>
                  <td className="px-3 py-2 text-[#364055]">
                    {formatDateTime(item.startsAt)}
                  </td>
                  <td className="px-3 py-2 text-[#364055]">
                    {formatDateTime(item.endsAt)}
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
