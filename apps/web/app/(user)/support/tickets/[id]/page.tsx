import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getServerSession } from '@elsesourav/auth';
import { getUserSupportTicketDetail } from '@/features/support/queries/get-support';
import { SupportTicketDetailView } from '@/features/support/components/SupportTicketDetailView';
import { PageShell } from '@elsesourav/ui';

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
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  return {
    title: `${ticket.ticketNumber}: ${ticket.subject} | ElseSourav Support`,
    description: `Support conversation for ticket ${ticket.ticketNumber}.`,
    robots: {
      index: false,
      follow: false,
    },
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
    <PageShell size="lg" glow>
      <div className="max-w-4xl mx-auto">
        <SupportTicketDetailView ticket={ticket} />
      </div>
    </PageShell>
  );
}
