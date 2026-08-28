import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getServerSession } from '@elsesourav/auth';
import { Card, Button } from '@elsesourav/ui';
import { LifeBuoy, PlusCircle, MessageSquare } from 'lucide-react';
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

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-100 tracking-tight">
            My Support Tickets
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            Submit inquiries, track issue tickets, and get technical assistance.
          </p>
        </div>

        <Link href="/help">
          <Button className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs gap-1.5 shadow-lg shadow-indigo-600/20">
            <PlusCircle className="w-3.5 h-3.5" /> Submit New Ticket
          </Button>
        </Link>
      </div>

      <Card className="py-16 px-4 text-center rounded-3xl border-zinc-800/80 bg-zinc-900/30 backdrop-blur-sm space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-950/60 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
          <MessageSquare className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-zinc-200">No active support tickets</h3>
          <p className="text-xs text-zinc-500 max-w-xs mx-auto">
            Need assistance with an application or account? Create a ticket to reach out to our team.
          </p>
        </div>
        <div className="pt-2">
          <Link href="/help">
            <Button variant="outline" size="sm" className="border-zinc-700 text-zinc-300 text-xs gap-1.5">
              <LifeBuoy className="w-3.5 h-3.5" /> Visit Knowledge Base
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
