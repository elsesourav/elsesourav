import type {
  BaseEntity,
  QueryOptions,
  RepositoryResult,
  PaginatedRepositoryResult,
} from './types';
import { AppError } from '@/lib/errors';
import { err } from '@/lib/result';

/**
 * Standard repository contract for data access
 */
export interface IRepository<
  T extends BaseEntity,
  TCreate = Omit<T, 'id' | 'createdAt' | 'updatedAt'>,
  TUpdate = Partial<Omit<T, 'id' | 'createdAt'>>,
> {
  findById(id: string): RepositoryResult<T | null>;
  findMany(options?: QueryOptions): PaginatedRepositoryResult<T>;
  create(data: TCreate, customId?: string): RepositoryResult<T>;
  update(id: string, data: TUpdate): RepositoryResult<T>;
  delete(id: string): RepositoryResult<void>;
}

/**
 * Abstract Base Repository to be extended by Firestore repositories
 */
export abstract class BaseRepository<
  T extends BaseEntity,
  TCreate = Omit<T, 'id' | 'createdAt' | 'updatedAt'>,
  TUpdate = Partial<Omit<T, 'id' | 'createdAt'>>,
> implements IRepository<T, TCreate, TUpdate> {
  protected readonly collectionName: string;

  constructor(collectionName: string) {
    this.collectionName = collectionName;
  }

  abstract findById(id: string): RepositoryResult<T | null>;
  abstract findMany(options?: QueryOptions): PaginatedRepositoryResult<T>;
  abstract create(data: TCreate, customId?: string): RepositoryResult<T>;
  abstract update(id: string, data: TUpdate): RepositoryResult<T>;
  abstract delete(id: string): RepositoryResult<void>;

  protected handleFirestoreError(error: unknown, action: string): AppError {
    if (error instanceof AppError) return error;
    const message = error instanceof Error ? error.message : 'Database operation failed';
    return AppError.internal(
      `Failed to ${action} in collection "${this.collectionName}": ${message}`,
      error
    );
  }

  protected notImplemented(methodName: string): RepositoryResult<never> {
    return Promise.resolve(
      err(
        AppError.internal(
          `Method ${methodName} not implemented yet in ${this.collectionName} repository`
        )
      )
    );
  }
}
