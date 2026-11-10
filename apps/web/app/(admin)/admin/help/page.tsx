import { Metadata } from 'next';
import { getAdminHelpList } from '@/features/admin/help/queries/get-admin-help';
import { AdminHelpTable } from '@/features/admin/help/components/AdminHelpTable';
import { PageHeader, Badge, Button } from '@elsesourav/ui';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Help Desk CMS | Admin Portal',
  description: 'Manage documentation guides, FAQs, and knowledge base categories.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminHelpPage() {
  const { articles, categories } = await getAdminHelpList();

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800/80 pb-5 sm:pb-6">
        <PageHeader
          eyebrow="Knowledge Base CMS"
          badge={
            <Badge variant="primary" className="text-[10px] sm:text-xs px-2 sm:px-2.5 py-0.5 font-medium">
              {articles.length} {articles.length === 1 ? 'Article' : 'Articles'}
            </Badge>
          }
          title="Help Desk Knowledge Base"
          description="Create, edit, and categorize documentation articles, user tutorials, and guides."
          className="pb-0 mb-0"
        />

        <Link href="/admin/help/new" className="shrink-0 w-full sm:w-auto">
          <Button
            size="sm"
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl gap-1.5 shadow-md shadow-indigo-600/20 w-full sm:w-auto justify-center"
          >
            <Plus className="w-3.5 h-3.5 shrink-0" />
            <span>Create Article</span>
          </Button>
        </Link>
      </div>

      <AdminHelpTable initialArticles={articles} categories={categories} />
    </div>
  );
}
