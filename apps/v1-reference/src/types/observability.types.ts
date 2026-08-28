/**
 * Observability, Error Reporting, and Telemetry Domain Types
 * Single-publisher, privacy-conscious diagnostics for ElseSourav
 */

export type ErrorCategory =
  | 'AUTHENTICATION'
  | 'AUTHORIZATION'
  | 'NETWORK'
  | 'FIRESTORE'
  | 'VALIDATION'
  | 'UI_RENDER'
  | 'PUBLISHING'
  | 'SUPPORT'
  | 'SEARCH'
  | 'UNKNOWN';

export type ErrorSeverity = 'fatal' | 'error' | 'warn' | 'info';

export interface ErrorReportContext {
  readonly route?: string;
  readonly feature?: string;
  readonly operation?: string;
  readonly metadata?: Record<string, unknown>;
  readonly componentStack?: string;
}

export interface SanitizedErrorReport {
  readonly id: string;
  readonly category: ErrorCategory;
  readonly severity: ErrorSeverity;
  readonly code: string;
  readonly message: string;
  readonly isFatal: boolean;
  readonly timestamp: number;
  readonly appVersion: string;
  readonly environment: string;
  readonly route?: string;
  readonly feature?: string;
  readonly operation?: string;
  readonly componentStack?: string;
  readonly context?: Record<string, unknown>;
  readonly url?: string;
}

export type ErrorReportListener = (report: SanitizedErrorReport) => void;

export type PerformanceMetricCategory =
  | 'page_load'
  | 'search'
  | 'content_fetch'
  | 'admin_action'
  | 'interaction';

export interface PerformanceMetric {
  readonly id: string;
  readonly name: string;
  readonly category: PerformanceMetricCategory;
  readonly durationMs: number;
  readonly timestamp: number;
  readonly metadata?: Record<string, unknown>;
}

export interface SystemHealthCheckResult {
  readonly status: 'pass' | 'fail' | 'warn';
  readonly message?: string;
  readonly durationMs?: number;
}

export interface SystemHealthReport {
  readonly status: 'healthy' | 'degraded' | 'unhealthy';
  readonly timestamp: number;
  readonly appVersion: string;
  readonly environment: string;
  readonly checks: {
    readonly configuration: SystemHealthCheckResult;
    readonly firebaseInit: SystemHealthCheckResult;
    readonly authentication: SystemHealthCheckResult;
    readonly firestore: SystemHealthCheckResult;
  };
  readonly totalDurationMs: number;
}
