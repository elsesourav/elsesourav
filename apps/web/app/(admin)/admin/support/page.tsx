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
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <PageHeader
        eyebrow="Customer Operations"
        badge={
          <Badge variant="primary" className="text-xs px-2.5 py-0.5 font-medium">
            {tickets.length} {tickets.length === 1 ? 'Ticket' : 'Tickets'}
          </Badge>
        }
        title="Support Desk Queue"
        description="Triage incoming support requests, answer user questions, and track issue resolutions."
      />

      <AdminSupportTable initialTickets={tickets} />
    </div>
  );
}
