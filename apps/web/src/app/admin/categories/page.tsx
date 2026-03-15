import { PageHeader, PageShell } from "@/components/ui/page";
import { requireAdminContext } from "@/lib/page-access";
import { fetchServiceData } from "@/lib/service-client";
import type { AdminCategory } from "@/lib/view-models";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const user = await requireAdminContext();
  const categories = await fetchServiceData<AdminCategory[]>({
    service: "catalog",
    path: "/v1/admin/catalog/categories",
    user,
  }).catch(() => []);

  return (
    <PageShell width="wide" className="gap-6">
      <PageHeader
        eyebrow="Admin Data"
        title="Categories"
        description="Database categories with app counts."
      />

      <Link href="/admin" className="text-sm font-medium underline">
        Back to admin
      </Link>

      {categories.length === 0 ? (
        <p className="text-sm text-[#4a5262]">No category records found.</p>
      ) : (
        <section className="overflow-x-auto rounded-xl border border-black/15 bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-black/10 bg-[#f6f7fb] text-xs uppercase tracking-wide text-[#4a5262]">
              <tr>
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Icon</th>
                <th className="px-3 py-2">Apps</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr
                  key={category.id}
                  className="border-b border-black/10 last:border-0"
                >
                  <td className="px-3 py-2 font-medium text-[#111722]">
                    {category.name}
                  </td>
                  <td className="px-3 py-2 text-[#364055]">
                    {category.icon ?? "-"}
                  </td>
                  <td className="px-3 py-2 text-[#364055]">
                    {category._count.apps}
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
