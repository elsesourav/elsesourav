import type { ID, Timestamp } from './common.types';

export interface AuditLog {
  readonly id: ID;
  readonly userId: ID;
  readonly userEmail?: string;
  readonly action: string;
  readonly entityType: string;
  readonly entityId?: string;
  readonly details?: Record<string, unknown>;
  readonly ipAddress?: string;
  readonly userAgent?: string;
  readonly timestamp: Timestamp;
}
