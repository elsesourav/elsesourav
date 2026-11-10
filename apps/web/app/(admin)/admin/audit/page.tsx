import { Metadata } from 'next';
import {
  getAdminAuditLogs,
  getAdminAuditSummary,
} from '@/features/admin/audit/queries/get-admin-audit';
import { AdminAuditTable } from '@/features/admin/audit/components/AdminAuditTable';
import { Badge } from '@elsesourav/ui';

export const metadata: Metadata = {
  title: 'Audit Logs | Admin Portal',
  description:
    'Observability and security audit trail for privileged operations, publishing actions, and role updates.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminAuditPage() {
  const [logs, summary] = await Promise.all([getAdminAuditLogs(), getAdminAuditSummary()]);

  return (
    <div className="space-y-6">
      {/* Standard Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono tracking-wider text-indigo-600 dark:text-indigo-400 uppercase">
              SECURITY &amp; GOVERNANCE
            </span>
            <span className="text-zinc-400 dark:text-zinc-600">/</span>
            <Badge
              variant="outline"
              className="text-[10px] px-1.5 py-0 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 font-mono"
            >
              {summary.totalLogs} {summary.totalLogs === 1 ? 'Record' : 'Records'}
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
            System Audit &amp; Security Trail
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1 max-w-2xl">
            Centralized observability logs capturing all security events, role elevations, publishing
            workflows, and media operations.
          </p>
        </div>
      </div>

      <AdminAuditTable initialLogs={logs} summary={summary} />
    </div>
  );
}
