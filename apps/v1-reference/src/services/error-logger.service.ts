import { AppError } from '@/lib/errors';
import { normalizeError } from '@/lib/error-normalization';
import { appConfig } from '@/config/app.config';
import type {
  ErrorCategory,
  ErrorSeverity,
  ErrorReportContext,
  SanitizedErrorReport,
  ErrorReportListener,
} from '@/types/observability.types';

export type {
  ErrorCategory,
  ErrorSeverity,
  ErrorReportContext,
  SanitizedErrorReport,
  ErrorReportListener,
};

/**
 * Sensitive key patterns to redact unconditionally for privacy & security
 */
const SENSITIVE_KEY_PATTERNS: readonly RegExp[] = [
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
  /messagebody/i,
  /privatecontent/i,
  /sessionid/i,
  /credentials/i,
];

/**
 * Infers an appropriate ErrorCategory from an AppError code or error message
 */
export function inferErrorCategory(code: string, message = ''): ErrorCategory {
  const normalizedCode = code.toUpperCase();
  const normalizedMsg = message.toLowerCase();

  if (
    normalizedCode.includes('AUTH') ||
    normalizedCode.includes('UNAUTHENTICATED') ||
    normalizedMsg.includes('sign in') ||
    normalizedMsg.includes('auth/')
  ) {
    return 'AUTHENTICATION';
  }

  if (
    normalizedCode.includes('PERMISSION') ||
    normalizedCode.includes('FORBIDDEN') ||
    normalizedCode.includes('UNAUTHORIZED') ||
    normalizedMsg.includes('permission')
  ) {
    return 'AUTHORIZATION';
  }

  if (
    normalizedCode.includes('NETWORK') ||
    normalizedCode.includes('OFFLINE') ||
    normalizedCode.includes('UNAVAILABLE') ||
    normalizedMsg.includes('network') ||
    normalizedMsg.includes('disconnected')
  ) {
    return 'NETWORK';
  }

  if (
    normalizedCode.includes('FIRESTORE') ||
    normalizedCode.includes('NOT_FOUND') ||
    normalizedCode.includes('ALREADY_EXISTS') ||
    normalizedMsg.includes('firestore')
  ) {
    return 'FIRESTORE';
  }

  if (
    normalizedCode.includes('VALIDATION') ||
    normalizedCode.includes('INVALID') ||
    normalizedMsg.includes('validation') ||
    normalizedMsg.includes('invalid')
  ) {
    return 'VALIDATION';
  }

  if (
    normalizedCode.includes('PUBLISH') ||
    normalizedCode.includes('RELEASE') ||
    normalizedMsg.includes('publish')
  ) {
    return 'PUBLISHING';
  }

  if (
    normalizedCode.includes('SUPPORT') ||
    normalizedCode.includes('TICKET') ||
    normalizedMsg.includes('ticket')
  ) {
    return 'SUPPORT';
  }

  if (
    normalizedCode.includes('SEARCH') ||
    normalizedMsg.includes('search')
  ) {
    return 'SEARCH';
  }

  if (
    normalizedCode.includes('RENDER') ||
    normalizedCode.includes('UI_') ||
    normalizedMsg.includes('react') ||
    normalizedMsg.includes('render')
  ) {
    return 'UI_RENDER';
  }

  return 'UNKNOWN';
}

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
      .replace(/(apiKey|oobCode|token|auth|password|secret)=([^&]+)/gi, '$1=[REDACTED]')
      .replace(/([?&]key=)([^&]+)/gi, '$1[REDACTED]');
  } catch {
    return '[REDACTED_URL]';
  }
}

/**
 * Enterprise-grade Centralized Observability & Error Logger Service
 */
export class ErrorLoggerService {
  private readonly listeners = new Set<ErrorReportListener>();

  /**
   * Captures and reports an error with structured categorization and privacy redaction
   */
  public logError(
    error: unknown,
    context?: Record<string, unknown> | ErrorReportContext,
    options?: {
      level?: ErrorSeverity;
      severity?: ErrorSeverity;
      category?: ErrorCategory;
      isFatal?: boolean;
      componentStack?: string;
    }
  ): SanitizedErrorReport {
    const appError = normalizeError(error);
    const severity: ErrorSeverity = options?.severity || options?.level || 'error';
    const isFatal = options?.isFatal ?? (severity === 'fatal');
    const category: ErrorCategory =
      options?.category || inferErrorCategory(appError.code, appError.message);

    // Redact all sensitive fields from context
    const rawContext = context || {};
    const sanitizedCtx = sanitizeContext(rawContext) as Record<string, unknown>;

    const route = typeof rawContext.route === 'string' ? rawContext.route : undefined;
    const feature = typeof rawContext.feature === 'string' ? rawContext.feature : undefined;
    const operation = typeof rawContext.operation === 'string' ? rawContext.operation : undefined;
    const componentStack = options?.componentStack || (typeof rawContext.componentStack === 'string' ? rawContext.componentStack : undefined);

    const report: SanitizedErrorReport = {
      id: `err-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      category,
      severity,
      code: appError.code,
      message: appError.message,
      isFatal,
      timestamp: Date.now(),
      appVersion: appConfig.version,
      environment: appConfig.environment,
      route,
      feature,
      operation,
      componentStack,
      context: sanitizedCtx,
      url: typeof window !== 'undefined' ? sanitizeUrlString(window.location.href) : undefined,
    };

    // Dispatch to registered subscribers
    this.notifySubscribers(report);

    // Development-only safe console diagnostic
    if (import.meta.env.DEV && !import.meta.env.VITEST) {
      const logFn =
        severity === 'fatal' || severity === 'error'
          ? console.error
          : severity === 'warn'
          ? console.warn
          : console.info;

      logFn(`[Observability] [${report.category}] [${report.code}] ${report.message}`, {
        version: report.appVersion,
        context: report.context,
        componentStack: report.componentStack,
      });
    }

    return report;
  }

  /**
   * Convenience method to report an error with category and context
   */
  public reportError(
    error: unknown,
    category?: ErrorCategory,
    context?: ErrorReportContext,
    severity: ErrorSeverity = 'error'
  ): SanitizedErrorReport {
    return this.logError(error, context?.metadata ? { ...context, ...context.metadata } : context, {
      category,
      severity,
      componentStack: context?.componentStack,
    });
  }

  /**
   * Logs a non-critical warning
   */
  public logWarning(
    message: string,
    context?: Record<string, unknown>,
    category: ErrorCategory = 'UNKNOWN'
  ): SanitizedErrorReport {
    return this.logError(new AppError('INTERNAL_ERROR', message), context, {
      level: 'warn',
      category,
    });
  }

  /**
   * Logs an informational observability event
   */
  public logInfo(
    message: string,
    context?: Record<string, unknown>,
    category: ErrorCategory = 'UNKNOWN'
  ): SanitizedErrorReport {
    return this.logError(new AppError('INTERNAL_ERROR', message), context, {
      level: 'info',
      category,
    });
  }

  /**
   * Register external listener for telemetry / monitoring subscribers
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
      } catch {
        // Prevent subscriber failures from cascading
      }
    });
  }
}

export const errorLogger = new ErrorLoggerService();
