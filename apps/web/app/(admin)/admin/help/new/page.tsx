import { Metadata } from 'next';
import { getAdminHelpList } from '@/features/admin/help/queries/get-admin-help';
import { AdminHelpForm } from '@/features/admin/help/components/AdminHelpForm';

export const metadata: Metadata = {
  title: 'Create Help Article | Admin Portal',
  description: 'Write a new knowledge base tutorial or guide.',
};

export default async function NewAdminHelpPage() {
  const { categories } = await getAdminHelpList();

  return (
    <div className="py-4">
      <AdminHelpForm categories={categories} />
    </div>
  );
}
