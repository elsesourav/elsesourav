import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAdminUserDetail } from '@/features/admin/users/queries/get-admin-users';
import { AdminUserDetailView } from '@/features/admin/users/components/AdminUserDetailView';

interface AdminUserDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: AdminUserDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `User Detail (${id}) | Admin Portal`,
  };
}

export default async function AdminUserDetailPage({
  params,
}: AdminUserDetailPageProps) {
  const { id } = await params;

  try {
    const user = await getAdminUserDetail(id);
    return (
      <div className="py-4">
        <AdminUserDetailView user={user} />
      </div>
    );
  } catch {
    notFound();
  }
}
