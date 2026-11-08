import { Metadata } from 'next';
import { getAdminUpdatesList } from '@/features/admin/updates/queries/get-admin-updates';
import { AdminUpdateForm } from '@/features/admin/updates/components/AdminUpdateForm';

export const metadata: Metadata = {
  title: 'Write Update | Admin Portal',
  description: 'Write a new engineering devlog or product update article.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function NewAdminUpdatePage() {
  const { categories, tags } = await getAdminUpdatesList();

  return (
    <div className="py-2 sm:py-4 w-full">
      <AdminUpdateForm categories={categories} tags={tags} />
    </div>
  );
}
