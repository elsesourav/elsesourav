export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface StructuredLogPayload {
  level: LogLevel;
  message: string;
  timestamp: string;
  requestId?: string;
  userId?: string;
  entityType?: string;
  entityId?: string;
  context?: Record<string, unknown>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

const REDACTED_PATTERNS = [
  'password',
  'token',
  'secret',
  'apikey',
  'refreshtoken',
  'accesstoken',
  'cookie',
  'authorization',
  'authheader',
  'credential',
];

export function sanitizeLogData(data?: Record<string, unknown>): Record<string, unknown> {
  if (!data || typeof data !== 'object') return {};
  const clean: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(data)) {
    const normalized = key.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (REDACTED_PATTERNS.some((pattern) => normalized.includes(pattern))) {
      clean[key] = '[REDACTED_SECRET]';
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      clean[key] = sanitizeLogData(value as Record<string, unknown>);
    } else {
      clean[key] = value;
    }
  }

  return clean;
}

export const logger = {
  info(message: string, context?: Record<string, unknown>, requestId?: string): void {
    const payload: StructuredLogPayload = {
      level: 'info',
      message,
      timestamp: new Date().toISOString(),
      requestId,
      context: sanitizeLogData(context),
    };
    if (process.env.NODE_ENV !== 'test') {
      console.info(JSON.stringify(payload));
    }
  },

  warn(message: string, context?: Record<string, unknown>, requestId?: string): void {
    const payload: StructuredLogPayload = {
      level: 'warn',
      message,
      timestamp: new Date().toISOString(),
      requestId,
      context: sanitizeLogData(context),
    };
    if (process.env.NODE_ENV !== 'test') {
      console.warn(JSON.stringify(payload));
    }
  },

  error(message: string, error?: unknown, context?: Record<string, unknown>, requestId?: string): void {
    const errorDetails =
      error instanceof Error
        ? {
            name: error.name,
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
          }
        : undefined;

    const payload: StructuredLogPayload = {
      level: 'error',
      message,
      timestamp: new Date().toISOString(),
      requestId,
      context: sanitizeLogData(context),
      error: errorDetails,
    };

    if (process.env.NODE_ENV !== 'test') {
      console.error(JSON.stringify(payload));
    }
  },
};
