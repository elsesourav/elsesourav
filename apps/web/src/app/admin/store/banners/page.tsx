import { PageHeader, PageShell } from "@/components/ui/page";
import { requireAdminContext } from "@/lib/page-access";
import { fetchServiceData } from "@/lib/service-client";
import { formatDateTime, type AdminBanner } from "@/lib/view-models";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminStoreBannersPage() {
  const user = await requireAdminContext();
  const banners = await fetchServiceData<AdminBanner[]>({
    service: "catalog",
    path: "/v1/admin/catalog/banners",
    user,
  }).catch(() => []);

  return (
    <PageShell width="wide" className="gap-6">
      <PageHeader
        eyebrow="Admin Data"
        title="Store Banners"
        description="Active and inactive banner records."
      />

      <Link href="/admin" className="text-sm font-medium underline">
        Back to admin
      </Link>

      {banners.length === 0 ? (
        <p className="text-sm text-[#4a5262]">No banner records found.</p>
      ) : (
        <section className="overflow-x-auto rounded-xl border border-black/15 bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-black/10 bg-[#f6f7fb] text-xs uppercase tracking-wide text-[#4a5262]">
              <tr>
                <th className="px-3 py-2">Title</th>
                <th className="px-3 py-2">Placement</th>
                <th className="px-3 py-2">Active</th>
                <th className="px-3 py-2">Starts</th>
                <th className="px-3 py-2">Ends</th>
                <th className="px-3 py-2">Updated</th>
              </tr>
            </thead>
            <tbody>
              {banners.map((banner) => (
                <tr
                  key={banner.id}
                  className="border-b border-black/10 last:border-0"
                >
                  <td className="px-3 py-2 font-medium text-[#111722]">
                    {banner.title}
                  </td>
                  <td className="px-3 py-2 text-[#364055]">
                    {banner.placement}
                  </td>
                  <td className="px-3 py-2 text-[#364055]">
                    {banner.isActive ? "Yes" : "No"}
                  </td>
                  <td className="px-3 py-2 text-[#364055]">
                    {formatDateTime(banner.startsAt)}
                  </td>
                  <td className="px-3 py-2 text-[#364055]">
                    {formatDateTime(banner.endsAt)}
                  </td>
                  <td className="px-3 py-2 text-[#364055]">
                    {formatDateTime(banner.updatedAt)}
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
