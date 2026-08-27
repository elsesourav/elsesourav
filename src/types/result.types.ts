/**
 * Result & Error Types
 * Functional error handling without throwing uncontrolled exceptions
 */

export type ErrorCode =
  | 'BAD_REQUEST'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'VALIDATION_ERROR'
  | 'CONFIGURATION_ERROR'
  | 'NETWORK_ERROR'
  | 'TIMEOUT'
  | 'INTERNAL_ERROR'
  | 'NOT_IMPLEMENTED';

export interface AppErrorDetails {
  readonly code: ErrorCode;
  readonly message: string;
  readonly field?: string;
  readonly cause?: unknown;
  readonly isRetryable?: boolean;
  readonly timestamp: number;
}

export type Ok<T> = {
  readonly success: true;
  readonly data: T;
};

export type Err<E = AppErrorDetails> = {
  readonly success: false;
  readonly error: E;
};

export type Result<T, E = AppErrorDetails> = Ok<T> | Err<E>;
