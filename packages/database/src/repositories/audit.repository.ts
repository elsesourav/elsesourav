import { Prisma, PrismaClient } from '@prisma/client';
import { prisma as defaultPrisma } from '../client';
import type {
  AuditLog as DomainAuditLog,
  AuditFilterParams,
  AuditSummaryMetrics,
} from '@elsesourav/types';

export class AuditRepository {
  constructor(private readonly prisma: PrismaClient = defaultPrisma) {}

  /**
   * Appends an audit log record to PostgreSQL
   */
  async logAction(data: {
    userId: string;
    action: string;
    entityType: string;
    entityId?: string;
    details?: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<DomainAuditLog> {
    const record = await this.prisma.auditLog.create({
      data: {
        userId: data.userId,
        action: data.action,
        entityType: data.entityType,
        entityId: data.entityId,
        details: (data.details as object) || {},
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            displayName: true,
            photoUrl: true,
            role: true,
          },
        },
      },
    });

    return {
      id: record.id,
      userId: record.userId,
      userEmail: record.user?.email,
      actor: record.user
        ? {
            id: record.user.id,
            email: record.user.email,
            displayName: record.user.displayName,
            photoUrl: record.user.photoUrl ?? undefined,
            role: record.user.role,
          }
        : undefined,
      action: record.action,
      entityType: record.entityType,
      entityId: record.entityId ?? undefined,
      details: (record.details as Record<string, unknown>) || {},
      ipAddress: record.ipAddress ?? undefined,
      userAgent: record.userAgent ?? undefined,
      timestamp: record.timestamp.getTime(),
    };
  }

  /**
   * Appends an audit log record inside an existing Prisma transaction
   */
  async logActionTx(
    tx: Prisma.TransactionClient,
    data: {
      userId: string;
      action: string;
      entityType: string;
      entityId?: string;
      details?: Record<string, unknown>;
      ipAddress?: string;
      userAgent?: string;
    }
  ): Promise<void> {
    await tx.auditLog.create({
      data: {
        userId: data.userId,
        action: data.action,
        entityType: data.entityType,
        entityId: data.entityId,
        details: (data.details as object) || {},
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      },
    });
  }

  /**
   * Retrieves paginated and filtered audit logs
   */
  async findLogs(filters: AuditFilterParams = {}): Promise<{
    logs: DomainAuditLog[];
    total: number;
  }> {
    const page = Math.max(filters.page ?? 1, 1);
    const limit = Math.min(Math.max(filters.limit ?? 50, 1), 100);
    const skip = (page - 1) * limit;

    const where: Prisma.AuditLogWhereInput = {};

    if (filters.action && filters.action !== 'all') {
      where.action = filters.action;
    }

    if (filters.resourceType && filters.resourceType !== 'all') {
      where.entityType = filters.resourceType;
    }

    if (filters.actorUserId) {
      where.userId = filters.actorUserId;
    }

    if (filters.dateFrom || filters.dateTo) {
      where.timestamp = {};
      if (filters.dateFrom) {
        where.timestamp.gte = new Date(filters.dateFrom);
      }
      if (filters.dateTo) {
        where.timestamp.lte = new Date(filters.dateTo);
      }
    }

    if (filters.search && filters.search.trim().length > 0) {
      const q = filters.search.trim();
      where.OR = [
        { action: { contains: q, mode: 'insensitive' } },
        { entityType: { contains: q, mode: 'insensitive' } },
        { entityId: { contains: q, mode: 'insensitive' } },
        { user: { email: { contains: q, mode: 'insensitive' } } },
        { user: { displayName: { contains: q, mode: 'insensitive' } } },
      ];
    }

    const [records, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        take: limit,
        skip,
        orderBy: { timestamp: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              displayName: true,
              photoUrl: true,
              role: true,
            },
          },
        },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    const logs: DomainAuditLog[] = records.map((r) => ({
      id: r.id,
      userId: r.userId,
      userEmail: r.user?.email,
      actor: r.user
        ? {
            id: r.user.id,
            email: r.user.email,
            displayName: r.user.displayName,
            photoUrl: r.user.photoUrl ?? undefined,
            role: r.user.role,
          }
        : undefined,
      action: r.action,
      entityType: r.entityType,
      entityId: r.entityId ?? undefined,
      details: (r.details as Record<string, unknown>) || {},
      ipAddress: r.ipAddress ?? undefined,
      userAgent: r.userAgent ?? undefined,
      timestamp: r.timestamp.getTime(),
    }));

    return { logs, total };
  }

  /**
   * Retrieves high-level metrics for the audit dashboard
   */
  async getSummaryMetrics(): Promise<AuditSummaryMetrics> {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [totalLogs, logsLast24Hours, securityAlertsCount, actorsGroup] = await Promise.all([
      this.prisma.auditLog.count(),
      this.prisma.auditLog.count({
        where: { timestamp: { gte: oneDayAgo } },
      }),
      this.prisma.auditLog.count({
        where: { action: { startsWith: 'SECURITY_' } },
      }),
      this.prisma.auditLog.groupBy({
        by: ['userId'],
      }),
    ]);

    return {
      totalLogs,
      logsLast24Hours,
      securityAlertsCount,
      uniqueActorsCount: actorsGroup.length,
    };
  }
}
