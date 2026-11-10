import { Metadata } from 'next';
import Link from 'next/link';
import { PageHeader, Badge, Button } from '@elsesourav/ui';
import { Plus } from 'lucide-react';
import { getAdminUpdatesList } from '@/features/admin/updates/queries/get-admin-updates';
import { AdminUpdatesTable } from '@/features/admin/updates/components/AdminUpdatesTable';

export const metadata: Metadata = {
  title: 'Updates & Devlogs CMS | Admin Portal',
  description: 'Manage devlog articles, product release updates, changelogs, and categories.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminUpdatesPage() {
  const { posts, categories } = await getAdminUpdatesList();

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800/80 pb-5 sm:pb-6">
        <PageHeader
          eyebrow="Editorial CMS"
          badge={
            <Badge variant="primary" className="text-[10px] sm:text-xs px-2 sm:px-2.5 py-0.5 font-medium">
              {posts.length} {posts.length === 1 ? 'Update' : 'Updates'}
            </Badge>
          }
          title="Updates & Devlogs"
          description="Create, edit, and publish engineering devlogs, deep dives, and software release updates."
          className="pb-0 mb-0"
        />

        <Link href="/admin/updates/new" className="shrink-0 w-full sm:w-auto">
          <Button
            size="sm"
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl gap-1.5 shadow-md shadow-indigo-600/20 w-full sm:w-auto justify-center"
          >
            <Plus className="w-3.5 h-3.5 shrink-0" />
            <span>Write New Update</span>
          </Button>
        </Link>
      </div>

      {/* Main Updates Table */}
      <AdminUpdatesTable initialPosts={posts} categories={categories} />
    </div>
  );
}
