import type { ErrorCode, AppErrorDetails } from '@/types/result.types';

/**
 * Custom strongly-typed application error class
 */
export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly field?: string;
  public override readonly cause?: unknown;
  public readonly timestamp: number;

  constructor(code: ErrorCode, message: string, options?: { field?: string; cause?: unknown }) {
    super(message, { cause: options?.cause });
    this.name = 'AppError';
    this.code = code;
    this.field = options?.field;
    this.cause = options?.cause;
    this.timestamp = Date.now();

    // Maintain proper prototype chain
    Object.setPrototypeOf(this, AppError.prototype);
  }

  public toJSON(): AppErrorDetails {
    return {
      code: this.code,
      message: this.message,
      field: this.field,
      cause: this.cause,
      timestamp: this.timestamp,
    };
  }

  public static badRequest(message: string, field?: string): AppError {
    return new AppError('BAD_REQUEST', message, { field });
  }

  public static unauthorized(message = 'Authentication required'): AppError {
    return new AppError('UNAUTHORIZED', message);
  }

  public static forbidden(message = 'Access denied'): AppError {
    return new AppError('FORBIDDEN', message);
  }

  public static notFound(resource = 'Resource', id?: string): AppError {
    const msg = id ? `${resource} with id "${id}" not found` : `${resource} not found`;
    return new AppError('NOT_FOUND', msg);
  }

  public static conflict(message: string, field?: string, cause?: unknown): AppError {
    return new AppError('CONFLICT', message, { field, cause });
  }

  public static validation(message: string, field?: string, cause?: unknown): AppError {
    return new AppError('VALIDATION_ERROR', message, { field, cause });
  }

  public static configuration(message: string, cause?: unknown): AppError {
    return new AppError('CONFIGURATION_ERROR', message, { cause });
  }

  public static internal(message = 'An unexpected error occurred', cause?: unknown): AppError {
    return new AppError('INTERNAL_ERROR', message, { cause });
  }

  public static network(message = 'Network connection failure', cause?: unknown): AppError {
    return new AppError('NETWORK_ERROR', message, { cause });
  }
}
