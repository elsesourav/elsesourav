import { Metadata } from 'next';
import { getAdminBlogList } from '@/features/admin/blog/queries/get-admin-blog';
import { AdminBlogTable } from '@/features/admin/blog/components/AdminBlogTable';

export const metadata: Metadata = {
  title: 'Devlog CMS | Admin Portal',
  description: 'Manage articles, release logs, developer updates, and categories.',
};

export default async function AdminBlogPage() {
  const { posts, categories } = await getAdminBlogList();

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-100 tracking-tight">
          Devlog Articles & Updates
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400">
          Create, edit, and publish engineering devlogs and product release notes.
        </p>
      </div>

      <AdminBlogTable initialPosts={posts} categories={categories} />
    </div>
  );
}
