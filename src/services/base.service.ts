import type { Result } from '@/types/result.types';
import { AppError } from '@/lib/errors';
import { ok, err } from '@/lib/result';
import type { z } from 'zod';

/**
 * Base Application Service providing validation and error handling primitives
 */
export abstract class BaseService {
  /**
   * Validates payload against a Zod schema returning a typed Result
   */
  protected validate<T>(schema: z.ZodType<T>, data: unknown): Result<T, AppError> {
    const result = schema.safeParse(data);
    if (!result.success) {
      const issue = result.error.issues[0];
      const message = issue ? issue.message : 'Validation failed';
      const path = issue?.path.join('.') || undefined;
      return err(AppError.validation(message, path, result.error));
    }
    return ok(result.data);
  }

  /**
   * Safely executes an async service operation with error normalization
   */
  protected async execute<T>(
    operation: () => Promise<Result<T, AppError>>,
    contextMessage: string
  ): Promise<Result<T, AppError>> {
    try {
      return await operation();
    } catch (error: unknown) {
      if (error instanceof AppError) {
        return err(error);
      }
      const message = error instanceof Error ? error.message : 'Unknown error';
      return err(AppError.internal(`${contextMessage}: ${message}`, error));
    }
  }
}
