import { Metadata } from 'next';
import { getAdminBlogList } from '@/features/admin/blog/queries/get-admin-blog';
import { AdminBlogForm } from '@/features/admin/blog/components/AdminBlogForm';

export const metadata: Metadata = {
  title: 'Write Article | Admin Portal',
  description: 'Write a new engineering devlog or product update article.',
};

export default async function NewAdminBlogPage() {
  const { categories, tags } = await getAdminBlogList();

  return (
    <div className="py-4">
      <AdminBlogForm categories={categories} tags={tags} />
    </div>
  );
}
