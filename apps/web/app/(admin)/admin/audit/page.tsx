import { Metadata } from 'next';
import {
  getAdminAuditLogs,
  getAdminAuditSummary,
} from '@/features/admin/audit/queries/get-admin-audit';
import { AdminAuditTable } from '@/features/admin/audit/components/AdminAuditTable';
import { PageHeader, Badge } from '@elsesourav/ui';

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
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <PageHeader
        eyebrow="Security & Governance"
        badge={
          <Badge variant="primary" className="text-xs px-2.5 py-0.5 font-medium">
            {summary.totalLogs} {summary.totalLogs === 1 ? 'Record' : 'Records'}
          </Badge>
        }
        title="System Audit & Security Trail"
        description="Centralized observability logs capturing all security events, role elevations, publishing workflows, and media operations."
      />

      <AdminAuditTable initialLogs={logs} summary={summary} />
    </div>
  );
}
