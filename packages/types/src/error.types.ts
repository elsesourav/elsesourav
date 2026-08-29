export type AppErrorCode =
  | 'VALIDATION_ERROR'
  | 'AUTHENTICATION_ERROR'
  | 'AUTHORIZATION_ERROR'
  | 'NOT_FOUND_ERROR'
  | 'DATABASE_ERROR'
  | 'EXTERNAL_SERVICE_ERROR'
  | 'RATE_LIMIT_ERROR'
  | 'UNKNOWN_ERROR';

export interface AppErrorMetadata {
  readonly code: AppErrorCode;
  readonly message: string;
  readonly status: number;
  readonly isRetryable: boolean;
  readonly details?: Record<string, unknown>;
  readonly timestamp: number;
}

export class AppError extends Error {
  public readonly code: AppErrorCode;
  public readonly status: number;
  public readonly isRetryable: boolean;
  public readonly details?: Record<string, unknown>;
  public readonly timestamp: number;

  constructor(
    code: AppErrorCode,
    message: string,
    options: {
      status?: number;
      isRetryable?: boolean;
      details?: Record<string, unknown>;
      cause?: unknown;
    } = {}
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.status =
      options.status ??
      (code === 'NOT_FOUND_ERROR'
        ? 404
        : code === 'VALIDATION_ERROR'
          ? 400
          : code === 'AUTHENTICATION_ERROR'
            ? 401
            : code === 'AUTHORIZATION_ERROR'
              ? 403
              : 500);
    this.isRetryable = options.isRetryable ?? false;
    this.details = options.details;
    this.timestamp = Date.now();
    if (options.cause) {
      this.cause = options.cause;
    }
  }

  public toJSON(): AppErrorMetadata {
    return {
      code: this.code,
      message: this.message,
      status: this.status,
      isRetryable: this.isRetryable,
      details: this.details,
      timestamp: this.timestamp,
    };
  }

  public static validation(message: string, details?: Record<string, unknown>): AppError {
    return new AppError('VALIDATION_ERROR', message, { status: 400, details });
  }

  public static unauthorized(message = 'Authentication required'): AppError {
    return new AppError('AUTHENTICATION_ERROR', message, { status: 401 });
  }

  public static forbidden(message = 'Access denied'): AppError {
    return new AppError('AUTHORIZATION_ERROR', message, { status: 403 });
  }

  public static notFound(resource = 'Resource'): AppError {
    return new AppError('NOT_FOUND_ERROR', `${resource} not found`, { status: 404 });
  }

  public static database(message: string, cause?: unknown): AppError {
    return new AppError('DATABASE_ERROR', message, { status: 500, isRetryable: true, cause });
  }

  public static external(service: string, message: string, cause?: unknown): AppError {
    return new AppError(
      'EXTERNAL_SERVICE_ERROR',
      `External service [${service}] failed: ${message}`,
      {
        status: 502,
        isRetryable: true,
        cause,
      }
    );
  }

  public static unknown(message = 'An unexpected error occurred', cause?: unknown): AppError {
    return new AppError('UNKNOWN_ERROR', message, { status: 500, cause });
  }
}
