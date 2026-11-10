import { Metadata } from 'next';
import Link from 'next/link';
import { PageHeader, Badge, Button } from '@elsesourav/ui';
import { Plus } from 'lucide-react';
import { getAdminAppsList } from '@/features/admin/apps/queries/get-admin-apps';
import { AdminAppsTable } from '@/features/admin/apps/components/AdminAppsTable';

export const metadata: Metadata = {
  title: 'Applications Catalog CMS | Admin Portal',
  description: 'Manage software catalog releases, versions, categories, and media assets.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminAppsPage() {
  const { apps, categories } = await getAdminAppsList({
    limit: 50,
    sortField: 'createdAt',
    sortDirection: 'desc',
  });

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800/80 pb-5 sm:pb-6">
        <PageHeader
          eyebrow="Catalog CMS"
          badge={
            <Badge variant="primary" className="text-[10px] sm:text-xs px-2 sm:px-2.5 py-0.5 font-medium">
              {apps.length} {apps.length === 1 ? 'App' : 'Apps'}
            </Badge>
          }
          title="Applications Catalog"
          description="Create, edit, publish releases, and manage software products across ElseSourav."
          className="pb-0 mb-0"
        />

        <Link href="/admin/apps/new" className="shrink-0 w-full sm:w-auto">
          <Button
            size="sm"
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl gap-1.5 shadow-md shadow-indigo-600/20 w-full sm:w-auto justify-center"
          >
            <Plus className="w-3.5 h-3.5 shrink-0" />
            <span>Create Application</span>
          </Button>
        </Link>
      </div>

      {/* Main Apps Table */}
      <AdminAppsTable initialApps={apps} categories={categories} />
    </div>
  );
}
