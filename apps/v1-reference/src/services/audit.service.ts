import type { IAuditLogRepository } from '@/repositories/interfaces';
import { auditLogRepository } from '@/repositories/audit.repository';
import type { AuditLog, CreateAuditLogDto } from '@/types/audit.types';
import type { QueryOptions, PaginatedResult } from '@/repositories/types';
import type { Result } from '@/types/result.types';
import { err } from '@/lib/result';
import { AppError } from '@/lib/errors';
import type { UserContext } from './support.service';

export interface IAuditService {
  recordAction(data: CreateAuditLogDto, actor: UserContext): Promise<Result<AuditLog, AppError>>;
  listLogs(
    actor: UserContext,
    options?: QueryOptions
  ): Promise<Result<PaginatedResult<AuditLog>, AppError>>;
  getLog(id: string, actor: UserContext): Promise<Result<AuditLog | null, AppError>>;
}

export class AuditService implements IAuditService {
  constructor(private readonly auditRepo: IAuditLogRepository = auditLogRepository) {}

  public async recordAction(
    data: CreateAuditLogDto,
    actor: UserContext
  ): Promise<Result<AuditLog, AppError>> {
    if (!actor || actor.role !== 'admin') {
      return err(AppError.forbidden('Admin permissions required to record audit log.'));
    }

    const payload: CreateAuditLogDto = {
      ...data,
      actorUserId: actor.id,
      actorEmail: actor.email || data.actorEmail,
    };

    return this.auditRepo.createLog(payload);
  }

  public async listLogs(
    actor: UserContext,
    options?: QueryOptions
  ): Promise<Result<PaginatedResult<AuditLog>, AppError>> {
    if (!actor || actor.role !== 'admin') {
      return err(AppError.forbidden('Admin permissions required to view audit logs.'));
    }

    return this.auditRepo.listLogs(options);
  }

  public async getLog(id: string, actor: UserContext): Promise<Result<AuditLog | null, AppError>> {
    if (!actor || actor.role !== 'admin') {
      return err(AppError.forbidden('Admin permissions required to view audit details.'));
    }

    return this.auditRepo.getLog(id);
  }
}

export const auditService = new AuditService();
