import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAdminArticleForEdit } from '@/features/admin/help/queries/get-admin-help';
import { AdminHelpForm } from '@/features/admin/help/components/AdminHelpForm';

interface EditAdminHelpPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: EditAdminHelpPageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Edit Help Article (${id}) | Admin Portal`,
  };
}

export default async function EditAdminHelpPage({ params }: EditAdminHelpPageProps) {
  const { id } = await params;

  try {
    const { article, categories } = await getAdminArticleForEdit(id);
    return (
      <div className="py-4">
        <AdminHelpForm article={article} categories={categories} />
      </div>
    );
  } catch {
    notFound();
  }
}
