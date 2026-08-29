import { Metadata } from 'next';
import { getAdminUsersList } from '@/features/admin/users/queries/get-admin-users';
import { AdminUsersTable } from '@/features/admin/users/components/AdminUsersTable';

export const metadata: Metadata = {
  title: 'User Management | Admin Portal',
  description: 'Manage registered users, roles, account permissions, and developer accounts.',
};

export default async function AdminUsersPage() {
  const { users, total, totalPages } = await getAdminUsersList();

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-100 tracking-tight">
          User & Identity Management
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400">
          Manage registered user accounts, role authorizations, account lifecycles, and support
          metrics.
        </p>
      </div>

      <AdminUsersTable initialUsers={users} total={total} totalPages={totalPages} />
    </div>
  );
}
