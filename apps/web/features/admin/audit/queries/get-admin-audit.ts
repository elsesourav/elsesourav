import { AuditRepository, AuditService } from '@elsesourav/database';
import { requireAdmin } from '../../guards/require-admin';
import type { AuditFilterParams, AuditListResult, AuditSummaryMetrics } from '@elsesourav/types';

const auditRepo = new AuditRepository();
const auditService = new AuditService(auditRepo);

export async function getAdminAuditLogs(filters: AuditFilterParams = {}): Promise<AuditListResult> {
  const context = await requireAdmin();
  return auditService.listAuditLogsAdmin(context.role, filters);
}

export async function getAdminAuditSummary(): Promise<AuditSummaryMetrics> {
  const context = await requireAdmin();
  return auditService.getAuditSummaryMetrics(context.role);
}
