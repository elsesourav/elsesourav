import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAdminPostForEdit } from '@/features/admin/updates/queries/get-admin-updates';
import { AdminUpdateForm } from '@/features/admin/updates/components/AdminUpdateForm';

interface EditAdminUpdatePageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: EditAdminUpdatePageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Edit Update (${id}) | Admin Portal`,
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function EditAdminUpdatePage({ params }: EditAdminUpdatePageProps) {
  const { id } = await params;

  try {
    const { post, categories, tags } = await getAdminPostForEdit(id);
    return (
      <div className="py-2 sm:py-4 w-full">
        <AdminUpdateForm post={post} categories={categories} tags={tags} />
      </div>
    );
  } catch {
    notFound();
  }
}
