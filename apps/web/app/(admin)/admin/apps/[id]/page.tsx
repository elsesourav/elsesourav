import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAdminAppForEdit } from '@/features/admin/apps/queries/get-admin-apps';
import { AdminAppForm } from '@/features/admin/apps/components/AdminAppForm';

interface EditAdminAppPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: EditAdminAppPageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Edit App (${id}) | Admin Portal`,
  };
}

export default async function EditAdminAppPage({ params }: EditAdminAppPageProps) {
  const { id } = await params;

  try {
    const { app, categories, tags } = await getAdminAppForEdit(id);
    return (
      <div className="py-4">
        <AdminAppForm app={app} categories={categories} tags={tags} />
      </div>
    );
  } catch {
    notFound();
  }
}
