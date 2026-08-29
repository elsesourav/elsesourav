import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getServerSession } from '@elsesourav/auth';
import { getUserSupportTicketDetail } from '@/features/support/queries/get-support';
import { SupportTicketDetailView } from '@/features/support/components/SupportTicketDetailView';

interface TicketDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: TicketDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const ticket = await getUserSupportTicketDetail(id);

  if (!ticket) {
    return {
      title: 'Ticket Not Found | ElseSourav Support',
      description: 'The requested support ticket does not exist or access is unauthorized.',
    };
  }

  return {
    title: `${ticket.ticketNumber}: ${ticket.subject} | ElseSourav Support`,
    description: `Support conversation for ticket ${ticket.ticketNumber}.`,
  };
}

export default async function UserTicketDetailPage({ params }: TicketDetailPageProps) {
  const cookieStore = await cookies();
  const session = await getServerSession({
    getAll: () => cookieStore.getAll(),
  });

  const { id } = await params;

  if (!session?.user) {
    redirect(`/login?next=/support/tickets/${id}`);
  }

  const ticket = await getUserSupportTicketDetail(id);

  if (!ticket) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <SupportTicketDetailView ticket={ticket} />
    </div>
  );
}
