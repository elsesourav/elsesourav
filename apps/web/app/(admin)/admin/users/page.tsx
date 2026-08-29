import { Metadata } from 'next';
import { getAdminUsersList } from '@/features/admin/users/queries/get-admin-users';
import { AdminUsersTable } from '@/features/admin/users/components/AdminUsersTable';
import { PageHeader, Badge } from '@elsesourav/ui';

export const metadata: Metadata = {
  title: 'User Management | Admin Portal',
  description: 'Manage registered users, roles, account permissions, and developer accounts.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminUsersPage() {
  const { users, total, totalPages } = await getAdminUsersList();

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <PageHeader
        eyebrow="Account Directory"
        badge={
          <Badge variant="primary" className="text-xs px-2.5 py-0.5 font-medium">
            {total} {total === 1 ? 'User' : 'Users'}
          </Badge>
        }
        title="User & Identity Management"
        description="Manage registered user accounts, role authorizations, account lifecycles, and support metrics."
      />

      <AdminUsersTable initialUsers={users} total={total} totalPages={totalPages} />
    </div>
  );
}
