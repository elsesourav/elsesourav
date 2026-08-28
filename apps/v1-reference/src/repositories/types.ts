import type { Result } from '@/types/result.types';
import type { ID, Timestamp } from '@/types/common.types';
import type { AppError } from '@/lib/errors';
import type { DocumentSnapshot } from 'firebase/firestore';

export interface BaseEntity {
  readonly id: ID;
  readonly createdAt: Timestamp;
  readonly updatedAt: Timestamp;
}

export type QueryOperator =
  '==' | '!=' | '<' | '<=' | '>' | '>=' | 'in' | 'not-in' | 'array-contains' | 'array-contains-any';

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
  readonly startAfterCursor?: unknown;
  readonly startAfterDoc?: DocumentSnapshot;
}

export interface PaginatedResult<T> {
  readonly items: readonly T[];
  readonly lastDoc?: DocumentSnapshot;
  readonly nextCursor?: string;
  readonly hasMore: boolean;
  readonly totalCount?: number;
}

export type RepositoryResult<T> = Promise<Result<T, AppError>>;
export type PaginatedRepositoryResult<T> = Promise<Result<PaginatedResult<T>, AppError>>;
