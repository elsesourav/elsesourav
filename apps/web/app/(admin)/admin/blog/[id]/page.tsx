import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAdminPostForEdit } from '@/features/admin/blog/queries/get-admin-blog';
import { AdminBlogForm } from '@/features/admin/blog/components/AdminBlogForm';

interface EditAdminBlogPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: EditAdminBlogPageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Edit Article (${id}) | Admin Portal`,
  };
}

export default async function EditAdminBlogPage({ params }: EditAdminBlogPageProps) {
  const { id } = await params;

  try {
    const { post, categories, tags } = await getAdminPostForEdit(id);
    return (
      <div className="py-4">
        <AdminBlogForm post={post} categories={categories} tags={tags} />
      </div>
    );
  } catch {
    notFound();
  }
}
