export type ID = string;
export type Timestamp = number;

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

export type SortDirection = 'asc' | 'desc';

export interface SortOption<TField extends string = string> {
  readonly field: TField;
  readonly direction: SortDirection;
}

export interface SearchFilterParams<TField extends string = string> {
  readonly query?: string;
  readonly category?: string;
  readonly tags?: readonly string[];
  readonly sort?: SortOption<TField>;
  readonly pagination?: PaginationParams;
}

export type LoadingStatus = 'idle' | 'loading' | 'success' | 'error';
