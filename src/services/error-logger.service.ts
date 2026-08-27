import { AppError } from '@/lib/errors';
import { normalizeError } from '@/lib/error-normalization';

/**
 * Sensitive key names to redact unconditionally
 */
const SENSITIVE_KEY_PATTERNS = [
  /password/i,
  /token/i,
  /apikey/i,
  /secret/i,
  /creditcard/i,
  /cardnumber/i,
  /cvv/i,
  /auth/i,
  /authorization/i,
  /oobcode/i,
  /privatemsg/i,
  /ticketmessage/i,
];

/**
 * Sanitized Error Report structure
 */
export interface SanitizedErrorReport {
  readonly id: string;
  readonly code: string;
  readonly message: string;
  readonly level: 'error' | 'warn' | 'info';
  readonly isFatal: boolean;
  readonly timestamp: number;
  readonly componentStack?: string;
  readonly context?: Record<string, unknown>;
  readonly url?: string;
}

export type ErrorReportListener = (report: SanitizedErrorReport) => void;

/**
 * Sanitizes an object by recursively masking sensitive keys and URL tokens
 */
export function sanitizeContext(context: unknown, depth = 0): unknown {
  if (depth > 4 || context === null || context === undefined) {
    return context;
  }

  if (typeof context === 'string') {
    return sanitizeUrlString(context);
  }

  if (typeof context === 'number' || typeof context === 'boolean') {
    return context;
  }

  if (Array.isArray(context)) {
    return context.map((item) => sanitizeContext(item, depth + 1));
  }

  if (typeof context === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(context as Record<string, unknown>)) {
      const isSensitive = SENSITIVE_KEY_PATTERNS.some((pattern) => pattern.test(key));
      if (isSensitive) {
        result[key] = '[REDACTED]';
      } else {
        result[key] = sanitizeContext(value, depth + 1);
      }
    }
    return result;
  }

  return String(context);
}

/**
 * Strips sensitive query parameter values from URL strings
 */
export function sanitizeUrlString(urlStr: string): string {
  try {
    if (!urlStr.includes('?') && !urlStr.includes('apiKey') && !urlStr.includes('token')) {
      return urlStr;
    }
    return urlStr
      .replace(/(apiKey|oobCode|token|auth|password)=([^&]+)/gi, '$1=[REDACTED]')
      .replace(/([?&]key=)([^&]+)/gi, '$1[REDACTED]');
  } catch {
    return '[REDACTED_URL]';
  }
}

/**
 * Enterprise-grade Error Logger & Reporter Service
 */
export class ErrorLoggerService {
  private readonly listeners = new Set<ErrorReportListener>();

  /**
   * Captures and reports an error
   */
  public logError(
    error: unknown,
    context?: Record<string, unknown>,
    options?: {
      level?: 'error' | 'warn' | 'info';
      isFatal?: boolean;
      componentStack?: string;
    }
  ): SanitizedErrorReport {
    const appError = normalizeError(error);
    const level = options?.level || 'error';
    const isFatal = options?.isFatal ?? false;

    // Redact all sensitive fields from context
    const sanitizedCtx = context
      ? (sanitizeContext(context) as Record<string, unknown>)
      : undefined;

    const report: SanitizedErrorReport = {
      id: `err-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      code: appError.code,
      message: appError.message,
      level,
      isFatal,
      timestamp: Date.now(),
      componentStack: options?.componentStack,
      context: sanitizedCtx,
      url: typeof window !== 'undefined' ? sanitizeUrlString(window.location.href) : undefined,
    };

    // Dispatch to subscribers
    this.notifySubscribers(report);

    // Development & Non-Test Console Logging
    if (import.meta.env.DEV && !import.meta.env.VITEST) {
      const logFn = level === 'error' ? console.error : level === 'warn' ? console.warn : console.info;
      logFn(`[ErrorLogger] [${report.code}] ${report.message}`, {
        sanitizedContext: sanitizedCtx,
        componentStack: report.componentStack,
        cause: appError.cause,
      });
    }

    return report;
  }

  /**
   * Logs a non-critical warning
   */
  public logWarning(message: string, context?: Record<string, unknown>): SanitizedErrorReport {
    return this.logError(new AppError('INTERNAL_ERROR', message), context, { level: 'warn' });
  }

  /**
   * Logs an informational message
   */
  public logInfo(message: string, context?: Record<string, unknown>): SanitizedErrorReport {
    return this.logError(new AppError('INTERNAL_ERROR', message), context, { level: 'info' });
  }

  /**
   * Register external listener (for future telemetry / monitoring hooks)
   */
  public subscribe(listener: ErrorReportListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifySubscribers(report: SanitizedErrorReport): void {
    this.listeners.forEach((listener) => {
      try {
        listener(report);
      } catch (e) {
        if (import.meta.env.DEV) {
          console.error('[ErrorLogger] Subscriber failed:', e);
        }
      }
    });
  }
}

export const errorLogger = new ErrorLoggerService();
