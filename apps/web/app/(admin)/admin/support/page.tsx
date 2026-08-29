import { Metadata } from 'next';
import { getAdminTicketsList } from '@/features/admin/support/queries/get-admin-support';
import { AdminSupportTable } from '@/features/admin/support/components/AdminSupportTable';

export const metadata: Metadata = {
  title: 'Support Desk Queue | Admin Portal',
  description: 'Manage user inquiries, tickets, bug reports, and customer requests.',
};

export default async function AdminSupportPage() {
  const tickets = await getAdminTicketsList();

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-100 tracking-tight">
          Support Desk Queue
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400">
          Triage incoming support requests, answer user questions, and track issue resolutions.
        </p>
      </div>

      <AdminSupportTable initialTickets={tickets} />
    </div>
  );
}
