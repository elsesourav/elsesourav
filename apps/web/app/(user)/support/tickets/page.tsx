import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getServerSession } from '@elsesourav/auth';
import { getUserSupportTickets } from '@/features/support/queries/get-support';
import { SupportTicketList } from '@/features/support/components/SupportTicketList';
import { PageShell, PageHeader, Button } from '@elsesourav/ui';
import { PlusCircle, LifeBuoy } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'My Support Tickets | ElseSourav',
  description: 'Manage support inquiries, issue reports, and assistance requests.',
  robots: {
    index: false,
    follow: false,
  },
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
    <PageShell size="lg" glow padded={false}>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <PageHeader
            eyebrow="Help & Support"
            title="My Support Tickets"
            description="Submit inquiries, track issue tickets, and get technical assistance from our team."
          />

          <div className="flex items-center gap-2.5 shrink-0 sm:pt-4">
            <Link href="/help">
              <Button
                variant="outline"
                size="sm"
                className="border-border text-foreground hover:bg-accent text-xs gap-1.5 rounded-xl cursor-pointer"
              >
                <LifeBuoy className="w-3.5 h-3.5 text-primary" />
                <span>Knowledge Base</span>
              </Button>
            </Link>
            <Link href="/support">
              <Button
                size="sm"
                className="text-xs gap-1.5 rounded-xl font-semibold shadow-sm cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>New Ticket</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Ticket List View */}
        <SupportTicketList tickets={tickets} />
      </div>
    </PageShell>
  );
}
