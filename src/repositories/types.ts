import type { Result } from '@/types/result.types';
import type { ID, Timestamp } from '@/types/common.types';
import type { AppError } from '@/lib/errors';

export interface BaseEntity {
  readonly id: ID;
  readonly createdAt: Timestamp;
  readonly updatedAt: Timestamp;
}

export type QueryOperator = '==' | '!=' | '<' | '<=' | '>' | '>=' | 'in' | 'array-contains';

export interface QueryFilter {
  readonly field: string;
  readonly operator: QueryOperator;
  readonly value: unknown;
}

export interface QueryOptions {
  readonly filters?: readonly QueryFilter[];
  readonly orderBy?: string;
  readonly orderDirection?: 'asc' | 'desc';
  readonly limit?: number;
  readonly startAfterId?: string;
}

export interface PaginatedResult<T> {
  readonly items: readonly T[];
  readonly nextCursor?: string;
  readonly hasMore: boolean;
  readonly totalCount?: number;
}

export type RepositoryResult<T> = Promise<Result<T, AppError>>;
export type PaginatedRepositoryResult<T> = Promise<Result<PaginatedResult<T>, AppError>>;
