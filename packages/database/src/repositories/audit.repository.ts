import { PrismaClient } from '@prisma/client';
import { prisma as defaultPrisma } from '../client';
import type { AuditLog as DomainAuditLog } from '@elsesourav/types';

export class AuditRepository {
  constructor(private readonly prisma: PrismaClient = defaultPrisma) {}

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
    });

    return {
      id: record.id,
      userId: record.userId,
      action: record.action,
      entityType: record.entityType,
      entityId: record.entityId ?? undefined,
      details: (record.details as Record<string, unknown>) || {},
      ipAddress: record.ipAddress ?? undefined,
      userAgent: record.userAgent ?? undefined,
      timestamp: record.timestamp.getTime(),
    };
  }

  async findRecentLogs(limit = 50): Promise<DomainAuditLog[]> {
    const records = await this.prisma.auditLog.findMany({
      take: limit,
      orderBy: { timestamp: 'desc' },
    });

    return records.map((r) => ({
      id: r.id,
      userId: r.userId,
      action: r.action,
      entityType: r.entityType,
      entityId: r.entityId ?? undefined,
      details: (r.details as Record<string, unknown>) || {},
      ipAddress: r.ipAddress ?? undefined,
      userAgent: r.userAgent ?? undefined,
      timestamp: r.timestamp.getTime(),
    }));
  }
}
