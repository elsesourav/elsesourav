import { Metadata } from 'next';
import { getAdminAppsList } from '@/features/admin/apps/queries/get-admin-apps';
import { AdminAppsTable } from '@/features/admin/apps/components/AdminAppsTable';

export const metadata: Metadata = {
  title: 'Applications Management | Admin Portal',
  description: 'Manage software catalog releases, versions, categories, and media assets.',
};

export default async function AdminAppsPage() {
  const { apps, categories } = await getAdminAppsList({
    limit: 50,
    sortField: 'createdAt',
    sortDirection: 'desc',
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-100 tracking-tight">
          Applications Catalog
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400">
          Create, edit, publish releases, and manage software products across ElseSourav.
        </p>
      </div>

      {/* Main Apps Table */}
      <AdminAppsTable initialApps={apps} categories={categories} />
    </div>
  );
}
