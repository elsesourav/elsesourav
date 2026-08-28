import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  errorLogger,
  sanitizeContext,
  sanitizeUrlString,
  inferErrorCategory,
} from '@/services/error-logger.service';
import { performanceTelemetry } from '@/services/performance-telemetry.service';
import { healthCheckService } from '@/services/health-check.service';
import { appConfig } from '@/config/app.config';
import type { SanitizedErrorReport } from '@/types/observability.types';

describe('Production Observability & Diagnostics Foundation (Prompt 76)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    performanceTelemetry.clearMetrics();
  });

  // ===========================================================================
  // TASK 1 & 2 — CENTRAL ERROR REPORTING & TYPED ERROR CATEGORIES
  // ===========================================================================
  describe('Task 1 & 2: Central Error Reporting & Category Classification', () => {
    it('routes unexpected errors through a central interface and assigns default categories', () => {
      const reports: SanitizedErrorReport[] = [];
      const unsubscribe = errorLogger.subscribe((report) => reports.push(report));

      const report = errorLogger.reportError(
        new Error('Network connection failed'),
        'NETWORK',
        { route: '/apps', feature: 'app_discovery' }
      );

      expect(report).toBeDefined();
      expect(report.id).toMatch(/^err-\d+-[a-z0-9]+$/);
      expect(report.category).toBe('NETWORK');
      expect(report.severity).toBe('error');
      expect(report.route).toBe('/apps');
      expect(report.feature).toBe('app_discovery');
      expect(report.appVersion).toBe(appConfig.version);
      expect(report.environment).toBe(appConfig.environment);

      expect(reports).toHaveLength(1);
      expect(reports[0]?.id).toBe(report.id);

      unsubscribe();
    });

    it('accurately infers typed error categories from AppError codes and messages', () => {
      expect(inferErrorCategory('UNAUTHENTICATED', 'User must sign in')).toBe('AUTHENTICATION');
      expect(inferErrorCategory('PERMISSION_DENIED', 'Missing required admin role')).toBe('AUTHORIZATION');
      expect(inferErrorCategory('NETWORK_ERROR', 'Network connection unavailable')).toBe('NETWORK');
      expect(inferErrorCategory('FIRESTORE_ERROR', 'Document not found')).toBe('FIRESTORE');
      expect(inferErrorCategory('VALIDATION_ERROR', 'Invalid email schema')).toBe('VALIDATION');
      expect(inferErrorCategory('PUBLISHING_ERROR', 'Failed to publish app')).toBe('PUBLISHING');
      expect(inferErrorCategory('SUPPORT_ERROR', 'Ticket submission failed')).toBe('SUPPORT');
      expect(inferErrorCategory('SEARCH_ERROR', 'Query execution failed')).toBe('SEARCH');
      expect(inferErrorCategory('UI_RENDER_ERROR', 'Component failed to render')).toBe('UI_RENDER');
      expect(inferErrorCategory('CUSTOM_UNKNOWN_CODE', 'Something went wrong')).toBe('UNKNOWN');
    });
  });

  // ===========================================================================
  // TASK 3, 8 & 10 — SAFE CONTEXT, VERSION IDENTIFICATION & PRIVACY FILTERING
  // ===========================================================================
  describe('Task 3, 8 & 10: Safe Context, Version Identification & Privacy Redaction', () => {
    it('redacts sensitive fields such as passwords, tokens, API keys, and credentials', () => {
      const sensitiveContext = {
        userId: 'usr-123',
        password: 'SuperSecretPassword123!',
        token: 'eyJh...jwtToken',
        apiKey: 'AIzaSyPrivateFirebaseKey',
        authorization: 'Bearer secret_token',
        ticketMessage: 'Private user inquiry body with confidential details',
        messageBody: 'Secret message',
        creditCard: '4111222233334444',
        safeMetadata: {
          browser: 'Chrome 120',
          view: 'apps_grid',
        },
      };

      const sanitized = sanitizeContext(sensitiveContext) as Record<string, unknown>;

      expect(sanitized.userId).toBe('usr-123');
      expect(sanitized.password).toBe('[REDACTED]');
      expect(sanitized.token).toBe('[REDACTED]');
      expect(sanitized.apiKey).toBe('[REDACTED]');
      expect(sanitized.authorization).toBe('[REDACTED]');
      expect(sanitized.ticketMessage).toBe('[REDACTED]');
      expect(sanitized.messageBody).toBe('[REDACTED]');
      expect(sanitized.creditCard).toBe('[REDACTED]');
      expect(sanitized.safeMetadata).toEqual({
        browser: 'Chrome 120',
        view: 'apps_grid',
      });
    });

    it('strips sensitive query parameters from URLs in error telemetry', () => {
      const unsafeUrl = 'https://elsesourav.com/login?apiKey=SECRET_123&oobCode=AUTH_CODE_XYZ&redirect=%2Fadmin';
      const sanitizedUrl = sanitizeUrlString(unsafeUrl);

      expect(sanitizedUrl).not.toContain('SECRET_123');
      expect(sanitizedUrl).not.toContain('AUTH_CODE_XYZ');
      expect(sanitizedUrl).toContain('apiKey=[REDACTED]');
      expect(sanitizedUrl).toContain('oobCode=[REDACTED]');
      expect(sanitizedUrl).toContain('redirect=%2Fadmin');
    });

    it('tags all error reports with application build version and environment', () => {
      const report = errorLogger.logError(new Error('Test error'));

      expect(report.appVersion).toBe('0.1.0');
      expect(report.environment).toBeDefined();
      expect(typeof report.timestamp).toBe('number');
    });
  });

  // ===========================================================================
  // TASK 5 — PERFORMANCE OBSERVABILITY
  // ===========================================================================
  describe('Task 5: Performance Telemetry & Measurement', () => {
    it('measures async operations without blocking and records timing metrics', async () => {
      const dummyOperation = async () => {
        return 'success-result';
      };

      const result = await performanceTelemetry.measure(
        'app_detail_fetch',
        'content_fetch',
        dummyOperation,
        { appId: 'app-terminal-pro' }
      );

      expect(result).toBe('success-result');

      const recentMetrics = performanceTelemetry.getRecentMetrics(10);
      expect(recentMetrics).toHaveLength(1);
      expect(recentMetrics[0]?.name).toBe('app_detail_fetch');
      expect(recentMetrics[0]?.category).toBe('content_fetch');
      expect(recentMetrics[0]?.durationMs).toBeGreaterThanOrEqual(0);
      expect(recentMetrics[0]?.metadata?.appId).toBe('app-terminal-pro');
    });

    it('filters recorded performance metrics by category', () => {
      performanceTelemetry.record('search_query', 'search', 45);
      performanceTelemetry.record('page_view', 'page_load', 120);
      performanceTelemetry.record('admin_save', 'admin_action', 80);

      const searchMetrics = performanceTelemetry.getMetricsByCategory('search');
      expect(searchMetrics).toHaveLength(1);
      expect(searchMetrics[0]?.name).toBe('search_query');
    });
  });

  // ===========================================================================
  // TASK 6 — APPLICATION HEALTH CHECK & DIAGNOSTICS
  // ===========================================================================
  describe('Task 6: Application Health Diagnostics', () => {
    it('runs non-destructive health diagnostics and returns a structured report', async () => {
      const report = await healthCheckService.runDiagnostics();

      expect(report).toBeDefined();
      expect(['healthy', 'degraded', 'unhealthy']).toContain(report.status);
      expect(report.appVersion).toBe(appConfig.version);
      expect(report.environment).toBe(appConfig.environment);

      // Verify individual check properties exist
      expect(report.checks.configuration).toBeDefined();
      expect(['pass', 'fail', 'warn']).toContain(report.checks.configuration.status);

      expect(report.checks.firebaseInit).toBeDefined();
      expect(['pass', 'fail', 'warn']).toContain(report.checks.firebaseInit.status);

      expect(report.checks.authentication).toBeDefined();
      expect(['pass', 'fail', 'warn']).toContain(report.checks.authentication.status);

      expect(report.checks.firestore).toBeDefined();
      expect(['pass', 'fail', 'warn']).toContain(report.checks.firestore.status);

      expect(report.totalDurationMs).toBeGreaterThanOrEqual(0);
    });
  });

  // ===========================================================================
  // TASK 9 — USER-FACING ERROR UX & RESILIENCE
  // ===========================================================================
  describe('Task 9: User-Facing Error Reporting Helper Methods', () => {
    it('supports warning and info level structured observability logs', () => {
      const warnReport = errorLogger.logWarning('Low disk cache warning', { cacheSize: '95%' }, 'NETWORK');
      expect(warnReport.severity).toBe('warn');
      expect(warnReport.category).toBe('NETWORK');

      const infoReport = errorLogger.logInfo('PWA service worker updated', { version: '0.1.0' }, 'UNKNOWN');
      expect(infoReport.severity).toBe('info');
    });
  });
});
