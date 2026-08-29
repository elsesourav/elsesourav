import { Metadata } from 'next';
import {
  getAdminAuditLogs,
  getAdminAuditSummary,
} from '@/features/admin/audit/queries/get-admin-audit';
import { AdminAuditTable } from '@/features/admin/audit/components/AdminAuditTable';

export const metadata: Metadata = {
  title: 'Audit Logs | Admin Portal',
  description: 'Observability and security audit trail for privileged operations, publishing actions, and role updates.',
};

export default async function AdminAuditPage() {
  const [logs, summary] = await Promise.all([
    getAdminAuditLogs(),
    getAdminAuditSummary(),
  ]);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-100 tracking-tight">
          System Audit & Security Trail
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400">
          Centralized observability logs capturing all security events, role elevations, publishing workflows, and media operations.
        </p>
      </div>

      <AdminAuditTable initialLogs={logs} summary={summary} />
    </div>
  );
}
