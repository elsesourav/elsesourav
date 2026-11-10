import { Metadata } from 'next';
import { getAdminTicketsList } from '@/features/admin/support/queries/get-admin-support';
import { AdminSupportTable } from '@/features/admin/support/components/AdminSupportTable';
import { PageHeader, Badge } from '@elsesourav/ui';

export const metadata: Metadata = {
  title: 'Support Desk Queue | Admin Portal',
  description: 'Manage user inquiries, tickets, bug reports, and customer requests.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminSupportPage() {
  const tickets = await getAdminTicketsList();

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="border-b border-zinc-200 dark:border-zinc-800/80 pb-5 sm:pb-6">
        <PageHeader
          eyebrow="Customer Operations"
          badge={
            <Badge variant="primary" className="text-[10px] sm:text-xs px-2 sm:px-2.5 py-0.5 font-medium">
              {tickets.length} {tickets.length === 1 ? 'Ticket' : 'Tickets'}
            </Badge>
          }
          title="Support Desk Queue"
          description="Triage incoming support requests, answer user questions, and track issue resolutions."
          className="pb-0 mb-0"
        />
      </div>

      <AdminSupportTable initialTickets={tickets} />
    </div>
  );
}
