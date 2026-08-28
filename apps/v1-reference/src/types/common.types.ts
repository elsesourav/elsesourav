/**
 * Core Common Types
 * Shared primitives, pagination, sorting, search, and async state
 */

export type ID = string;
export type Timestamp = number;

/**
 * Standard Schema Evolution & Versioning Mixin
 */
export interface SchemaVersioned {
  readonly schemaVersion?: number;
}

/**
 * Standard Pagination Request & Response
 */
export interface PaginationParams {
  readonly page?: number;
  readonly limit: number;
  readonly cursor?: string;
}

export interface PaginationMeta {
  readonly total?: number;
  readonly page?: number;
  readonly limit: number;
  readonly hasMore: boolean;
  readonly nextCursor?: string;
  readonly prevCursor?: string;
}

export interface Paginated<T> {
  readonly items: readonly T[];
  readonly meta: PaginationMeta;
}

/**
 * Sorting Primitives
 */
export type SortDirection = 'asc' | 'desc';

export interface SortOption<TField extends string = string> {
  readonly field: TField;
  readonly direction: SortDirection;
}

/**
 * Generic Search & Filter Parameters
 */
export interface SearchFilterParams<TField extends string = string> {
  readonly query?: string;
  readonly category?: string;
  readonly tags?: readonly string[];
  readonly sort?: SortOption<TField>;
  readonly pagination?: PaginationParams;
}

/**
 * Asynchronous Operation & UI State
 */
export type LoadingStatus = 'idle' | 'loading' | 'success' | 'error';

export interface AsyncState<T, E = Error> {
  readonly status: LoadingStatus;
  readonly data: T | null;
  readonly error: E | null;
  readonly isLoading: boolean;
  readonly isSuccess: boolean;
  readonly isError: boolean;
  readonly isIdle: boolean;
}
