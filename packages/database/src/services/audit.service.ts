import { AuditRepository } from '../repositories/audit.repository';
import { AppError } from '@elsesourav/types';
import type {
  AuditFilterParams,
  AuditListResult,
  AuditSummaryMetrics,
  RecordAuditParams,
  UserRole,
} from '@elsesourav/types';

const SENSITIVE_PATTERNS = [
  'password',
  'token',
  'secret',
  'apikey',
  'refreshtoken',
  'accesstoken',
  'cookie',
  'authorization',
  'authheader',
  'credential',
  'creditcard',
];

/**
 * Strips all sensitive data, passwords, secrets, and auth tokens from audit metadata
 */
export function sanitizeAuditDetails(details?: Record<string, unknown>): Record<string, unknown> {
  if (!details || typeof details !== 'object') return {};

  const clean: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(details)) {
    const normalizedKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');

    if (SENSITIVE_PATTERNS.some((pattern) => normalizedKey.includes(pattern))) {
      clean[key] = '[REDACTED_SECRET]';
      continue;
    }

    if (value && typeof value === 'object' && !Array.isArray(value)) {
      clean[key] = sanitizeAuditDetails(value as Record<string, unknown>);
    } else {
      clean[key] = value;
    }
  }

  return clean;
}

export class AuditService {
  constructor(private readonly auditRepo: AuditRepository) {}

  private verifyAdmin(callerRole?: UserRole | string): void {
    if (callerRole !== 'ADMIN' && callerRole !== 'STAFF') {
      throw AppError.forbidden('Administrative privileges are required to view audit records.');
    }
  }

  /**
   * Safe centralized method for recording an audit event.
   * Catches errors to ensure business operations are never disrupted by non-critical audit log failures.
   */
  async recordAuditEvent(params: RecordAuditParams): Promise<void> {
    if (!params.actorUserId) {
      return; // Skip if no actor can be resolved
    }

    try {
      const sanitizedDetails = sanitizeAuditDetails(params.details);

      await this.auditRepo.logAction({
        userId: params.actorUserId,
        action: params.action,
        entityType: params.resourceType,
        entityId: params.resourceId,
        details: sanitizedDetails,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
      });
    } catch {
      // Intentionally do not re-throw to avoid failing business operations
    }
  }

  /**
   * Retrieves paginated audit logs for Admin inspection
   */
  async listAuditLogsAdmin(
    callerRole: UserRole,
    filters: AuditFilterParams = {}
  ): Promise<AuditListResult> {
    this.verifyAdmin(callerRole);

    const limit = Math.min(Math.max(filters.limit ?? 50, 1), 100);
    const page = Math.max(filters.page ?? 1, 1);

    const { logs, total } = await this.auditRepo.findLogs({
      ...filters,
      page,
      limit,
    });

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      logs,
      total,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * Retrieves summary metrics for the audit log dashboard
   */
  async getAuditSummaryMetrics(callerRole: UserRole): Promise<AuditSummaryMetrics> {
    this.verifyAdmin(callerRole);
    return this.auditRepo.getSummaryMetrics();
  }
}
