import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAdminTicketDetail } from '@/features/admin/support/queries/get-admin-support';
import { AdminTicketDetailView } from '@/features/admin/support/components/AdminTicketDetailView';

interface AdminTicketDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: AdminTicketDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Support Ticket (${id}) | Admin Portal`,
  };
}

export default async function AdminTicketDetailPage({
  params,
}: AdminTicketDetailPageProps) {
  const { id } = await params;

  try {
    const ticket = await getAdminTicketDetail(id);
    return (
      <div className="py-4">
        <AdminTicketDetailView ticket={ticket} />
      </div>
    );
  } catch {
    notFound();
  }
}
