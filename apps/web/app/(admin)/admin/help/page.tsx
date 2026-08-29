import { Metadata } from 'next';
import { getAdminHelpList } from '@/features/admin/help/queries/get-admin-help';
import { AdminHelpTable } from '@/features/admin/help/components/AdminHelpTable';

export const metadata: Metadata = {
  title: 'Help Desk CMS | Admin Portal',
  description: 'Manage documentation guides, FAQs, and knowledge base categories.',
};

export default async function AdminHelpPage() {
  const { articles, categories } = await getAdminHelpList();

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-100 tracking-tight">
          Help Desk Knowledge Base
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400">
          Create, edit, and categorize documentation articles, user tutorials, and guides.
        </p>
      </div>

      <AdminHelpTable initialArticles={articles} categories={categories} />
    </div>
  );
}
