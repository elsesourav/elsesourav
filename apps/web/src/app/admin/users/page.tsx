import { PageHeader } from "@/components/ui/page";
import { requireAdminContext } from "@/lib/page-access";
import { fetchServiceData } from "@/lib/service-client";
import type { AdminUser } from "@/lib/view-models";

import { AdminUsersClient } from "./client";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const user = await requireAdminContext();
  const users = await fetchServiceData<AdminUser[]>({
    service: "auth",
    path: "/v1/auth/admin/users",
    user,
  }).catch(() => []);

  return (
    <div className="space-y-4 p-4 sm:p-5 lg:p-6">
      <PageHeader
        eyebrow="People"
        title="Users"
        description="Search users and manage role access with guarded confirmations."
      />

      <AdminUsersClient initialUsers={users} currentUserId={user.id} />
    </div>
  );
}
