import type { AuditLog, AuditAction, AuditResourceType } from '@elsesourav/types';

let auditCounter = 1;

export function resetAuditFactoryCounter(): void {
  auditCounter = 1;
}

export function createAuditLogEntry(overrides?: Partial<AuditLog>): AuditLog {
  const index = auditCounter++;
  return {
    id: overrides?.id || `audit-test-${index}`,
    userId: overrides?.userId || 'usr-admin-1',
    userEmail: overrides?.userEmail || 'admin@example.test',
    action: (overrides?.action as AuditAction) || 'APP_CREATED',
    entityType: (overrides?.entityType as AuditResourceType) || 'APP',
    entityId: overrides?.entityId || `app-test-${index}`,
    details: overrides?.details || { version: `2.${index}.0`, environment: 'production' },
    ipAddress: overrides?.ipAddress || '127.0.0.1',
    userAgent: overrides?.userAgent || 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    timestamp: overrides?.timestamp ?? 1704067200000 + index * 1000,
  };
}
