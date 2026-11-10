import { Metadata } from 'next';
import { getAdminUsersList } from '@/features/admin/users/queries/get-admin-users';
import { AdminUsersTable } from '@/features/admin/users/components/AdminUsersTable';
import { Badge } from '@elsesourav/ui';

export const metadata: Metadata = {
  title: 'User Directory | Admin Portal',
  description: 'Manage registered user accounts, role authorizations, account lifecycles, and support metrics.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminUsersPage() {
  const { users, total, totalPages } = await getAdminUsersList();

  return (
    <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800/80 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Account Directory
            </span>
            <Badge variant="outline" className="text-[10px] font-mono border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400">
              {total} {total === 1 ? 'User' : 'Users'}
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
            User & Identity Directory
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-2xl">
            Manage registered user accounts, role authorizations, account lifecycles, and support metrics.
          </p>
        </div>
      </div>

      <AdminUsersTable initialUsers={users} total={total} totalPages={totalPages} />
    </div>
  );
}
