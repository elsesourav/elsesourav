import { Metadata } from 'next';
import { getAdminBlogList } from '@/features/admin/blog/queries/get-admin-blog';
import { AdminBlogTable } from '@/features/admin/blog/components/AdminBlogTable';
import { PageHeader, Badge, Button } from '@elsesourav/ui';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Devlog CMS | Admin Portal',
  description: 'Manage articles, release logs, developer updates, and categories.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminBlogPage() {
  const { posts, categories } = await getAdminBlogList();

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          eyebrow="Editorial CMS"
          badge={
            <Badge variant="primary" className="text-xs px-2.5 py-0.5 font-medium">
              {posts.length} {posts.length === 1 ? 'Article' : 'Articles'}
            </Badge>
          }
          title="Devlog Articles & Updates"
          description="Create, edit, and publish engineering devlogs and product release notes."
        />

        <Link href="/admin/blog/new" className="shrink-0 self-start sm:self-auto sm:pt-4">
          <Button
            size="sm"
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-xl gap-1.5 shadow-lg shadow-indigo-600/20"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Write New Article</span>
          </Button>
        </Link>
      </div>

      <AdminBlogTable initialPosts={posts} categories={categories} />
    </div>
  );
}
