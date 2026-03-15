import { PageHeader, PageShell } from "@/components/ui/page";
import { requireAdminContext } from "@/lib/page-access";
import { fetchServiceData } from "@/lib/service-client";
import { formatDateTime, type AdminThemeConfig } from "@/lib/view-models";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminThemeConfigsPage() {
  const user = await requireAdminContext();
  const configs = await fetchServiceData<AdminThemeConfig[]>({
    service: "theme",
    path: "/v1/admin/theme/configs",
    user,
  }).catch(() => []);

  return (
    <PageShell width="wide" className="gap-6">
      <PageHeader
        eyebrow="Admin Data"
        title="Theme Configs"
        description="Theme records used by the dynamic UI layer."
      />

      <Link href="/admin" className="text-sm font-medium underline">
        Back to admin
      </Link>

      {configs.length === 0 ? (
        <p className="text-sm text-[#4a5262]">No theme config records found.</p>
      ) : (
        <section className="overflow-x-auto rounded-xl border border-black/15 bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-black/10 bg-[#f6f7fb] text-xs uppercase tracking-wide text-[#4a5262]">
              <tr>
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Active</th>
                <th className="px-3 py-2">Primary</th>
                <th className="px-3 py-2">Secondary</th>
                <th className="px-3 py-2">Accent</th>
                <th className="px-3 py-2">Updated</th>
              </tr>
            </thead>
            <tbody>
              {configs.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-black/10 last:border-0"
                >
                  <td className="px-3 py-2 font-medium text-[#111722]">
                    {item.name}
                  </td>
                  <td className="px-3 py-2 text-[#364055]">
                    {item.isActive ? "Yes" : "No"}
                  </td>
                  <td className="px-3 py-2 text-[#364055]">
                    {item.primaryColor}
                  </td>
                  <td className="px-3 py-2 text-[#364055]">
                    {item.secondaryColor}
                  </td>
                  <td className="px-3 py-2 text-[#364055]">
                    {item.accentColor}
                  </td>
                  <td className="px-3 py-2 text-[#364055]">
                    {formatDateTime(item.updatedAt)}
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
