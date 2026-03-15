import { PageHeader, PageShell } from "@/components/ui/page";
import { requireAdminContext } from "@/lib/page-access";
import { fetchServiceData } from "@/lib/service-client";
import { formatDateTime, type AdminUser } from "@/lib/view-models";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const user = await requireAdminContext();
  const users = await fetchServiceData<AdminUser[]>({
    service: "auth",
    path: "/v1/auth/admin/users",
    user,
  }).catch(() => []);

  return (
    <PageShell width="wide" className="gap-6">
      <PageHeader
        eyebrow="Admin Data"
        title="Users"
        description="Users, roles, and usage totals from the database."
      />

      <Link href="/admin" className="text-sm font-medium underline">
        Back to admin
      </Link>

      {users.length === 0 ? (
        <p className="text-sm text-[#4a5262]">No user records found.</p>
      ) : (
        <section className="overflow-x-auto rounded-xl border border-black/15 bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-black/10 bg-[#f6f7fb] text-xs uppercase tracking-wide text-[#4a5262]">
              <tr>
                <th className="px-3 py-2">User</th>
                <th className="px-3 py-2">Role</th>
                <th className="px-3 py-2">Library</th>
                <th className="px-3 py-2">Feedback</th>
                <th className="px-3 py-2">Payments</th>
                <th className="px-3 py-2">Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-black/10 last:border-0"
                >
                  <td className="px-3 py-2">
                    <p className="font-medium text-[#111722]">
                      {item.name ?? "Unnamed user"}
                    </p>
                    <p className="text-xs text-[#4a5262]">{item.email}</p>
                  </td>
                  <td className="px-3 py-2 text-[#364055]">{item.role}</td>
                  <td className="px-3 py-2 text-[#364055]">
                    {item._count.libraries}
                  </td>
                  <td className="px-3 py-2 text-[#364055]">
                    {item._count.feedbacks}
                  </td>
                  <td className="px-3 py-2 text-[#364055]">
                    {item._count.payments}
                  </td>
                  <td className="px-3 py-2 text-[#364055]">
                    {formatDateTime(item.createdAt)}
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
