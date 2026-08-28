import type { Result } from '@/types/result.types';
import { AppError } from '@/lib/errors';
import { err } from '@/lib/result';
import { isRetryableError } from '@/lib/error-normalization';

export interface RetryOptions {
  /**
   * Maximum number of retry attempts after the initial failure. Defaults to 2 (total 3 attempts).
   */
  readonly maxRetries?: number;
  /**
   * Initial delay in milliseconds before the first retry. Defaults to 300ms.
   */
  readonly initialDelayMs?: number;
  /**
   * Exponential backoff multiplier. Defaults to 2.
   */
  readonly backoffMultiplier?: number;
  /**
   * Optional custom predicate to determine if a specific error is retryable.
   */
  readonly isRetryable?: (error: AppError) => boolean;
  /**
   * Callback invoked before each retry attempt.
   */
  readonly onRetry?: (attempt: number, error: AppError, delayMs: number) => void;
}

/**
 * Deliberate, bounded exponential-backoff retry runner.
 * Strictly guarantees that non-transient errors (401, 403, 404, validation errors)
 * are NEVER retried, and that retries are bounded to prevent infinite loops.
 */
export async function withRetry<T>(
  operation: () => Promise<Result<T, AppError>>,
  options?: RetryOptions
): Promise<Result<T, AppError>> {
  const maxRetries = Math.min(Math.max(options?.maxRetries ?? 2, 0), 5); // Safety clamp [0, 5]
  const initialDelayMs = Math.max(options?.initialDelayMs ?? 300, 10);
  const backoffMultiplier = options?.backoffMultiplier ?? 2;
  const isRetryableFn = options?.isRetryable ?? isRetryableError;

  let attempt = 0;

  while (attempt <= maxRetries) {
    try {
      const result = await operation();

      if (result.success) {
        return result;
      }

      const error = result.error;

      // Check if error is transient and we have remaining retries
      if (attempt < maxRetries && isRetryableFn(error)) {
        attempt++;
        const delay = initialDelayMs * Math.pow(backoffMultiplier, attempt - 1);

        if (options?.onRetry) {
          options.onRetry(attempt, error, delay);
        }

        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      // Non-retryable error or exhausted retries
      return result;
    } catch (unexpectedError) {
      const appError =
        unexpectedError instanceof AppError
          ? unexpectedError
          : AppError.internal('Unexpected error during operation execution', unexpectedError);

      if (attempt < maxRetries && isRetryableFn(appError)) {
        attempt++;
        const delay = initialDelayMs * Math.pow(backoffMultiplier, attempt - 1);

        if (options?.onRetry) {
          options.onRetry(attempt, appError, delay);
        }

        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      return err(appError);
    }
  }

  return err(AppError.network('Operation failed after maximum retry attempts.'));
}
