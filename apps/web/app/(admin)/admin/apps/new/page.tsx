import { Metadata } from 'next';
import { getAdminAppsList } from '@/features/admin/apps/queries/get-admin-apps';
import { AdminAppForm } from '@/features/admin/apps/components/AdminAppForm';

export const metadata: Metadata = {
  title: 'New Application | Admin Portal',
  description: 'Add a new software product to the ElseSourav catalog.',
};

export default async function NewAdminAppPage() {
  const { categories, tags } = await getAdminAppsList();

  return (
    <div className="py-4">
      <AdminAppForm categories={categories} tags={tags} />
    </div>
  );
}
