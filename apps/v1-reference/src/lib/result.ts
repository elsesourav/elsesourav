import type { Result, Ok, Err, AppErrorDetails } from '@/types/result.types';
import { AppError } from './errors';

/**
 * Creates a successful Result
 */
export function ok<T>(data: T): Ok<T> {
  return { success: true, data };
}

/**
 * Creates an error Result
 */
export function err<E = AppErrorDetails>(error: E): Err<E> {
  return { success: false, error };
}

/**
 * Type guard for successful Result
 */
export function isOk<T, E>(result: Result<T, E>): result is Ok<T> {
  return result.success;
}

/**
 * Type guard for error Result
 */
export function isErr<T, E>(result: Result<T, E>): result is Err<E> {
  return !result.success;
}

/**
 * Safely unwrap data from a Result or return a fallback value
 */
export function unwrapOr<T, E>(result: Result<T, E>, fallback: T): T {
  return isOk(result) ? result.data : fallback;
}

/**
 * Safely wraps a promise in a Result, converting unknown rejections to AppError
 */
export async function fromPromise<T>(
  promise: Promise<T>,
  fallbackMessage = 'Operation failed'
): Promise<Result<T, AppError>> {
  try {
    const data = await promise;
    return ok(data);
  } catch (error: unknown) {
    if (error instanceof AppError) {
      return err(error);
    }
    const message = error instanceof Error ? error.message : fallbackMessage;
    return err(AppError.internal(message, error));
  }
}
