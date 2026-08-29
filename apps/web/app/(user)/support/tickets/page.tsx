import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getServerSession } from '@elsesourav/auth';
import { getUserSupportTickets } from '@/features/support/queries/get-support';
import { SupportTicketList } from '@/features/support/components/SupportTicketList';
import { Button } from '@elsesourav/ui';
import { PlusCircle, LifeBuoy } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'My Support Tickets | ElseSourav',
  description: 'Manage support inquiries, issue reports, and assistance requests.',
};

export default async function UserSupportTicketsPage() {
  const cookieStore = await cookies();
  const session = await getServerSession({
    getAll: () => cookieStore.getAll(),
  });

  if (!session?.user) {
    redirect('/login?next=/support/tickets');
  }

  const tickets = await getUserSupportTickets();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-100 tracking-tight">
            My Support Tickets
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            Submit inquiries, track issue tickets, and get technical assistance from our team.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/help">
            <Button
              variant="outline"
              size="sm"
              className="border-zinc-800 text-zinc-300 text-xs gap-1.5"
            >
              <LifeBuoy className="w-3.5 h-3.5" /> Knowledge Base
            </Button>
          </Link>
          <Link href="/support">
            <Button
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs gap-1.5 shadow-lg shadow-indigo-600/20"
            >
              <PlusCircle className="w-3.5 h-3.5" /> New Ticket
            </Button>
          </Link>
        </div>
      </div>

      {/* Ticket List View */}
      <SupportTicketList tickets={tickets} />
    </div>
  );
}
