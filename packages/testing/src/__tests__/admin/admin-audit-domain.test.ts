import { describe, it, expect, vi } from 'vitest';
import { AuditService, AuditRepository, sanitizeAuditDetails } from '@elsesourav/database';
import { AppError } from '@elsesourav/types';

describe('Audit Domain & Observability Security Tests', () => {
  describe('Metadata Sanitization & Redaction', () => {
    it('redacts sensitive credentials, tokens, and secrets from audit payloads', () => {
      const sensitivePayload = {
        appId: 'app-123',
        appName: 'ElseSourav Suite',
        password: 'SuperSecretPassword123!',
        token: 'eyJh...jwt_token',
        api_key: 'sk_live_1234567890',
        refreshToken: 'rt_987654321',
        authorization: 'Bearer sensitive-token',
        nestedData: {
          userEmail: 'admin@elsesourav.com',
          clientSecret: 'secret_key_abc',
          validConfig: 'enabled',
        },
      };

      const sanitized = sanitizeAuditDetails(sensitivePayload);

      expect(sanitized.appId).toBe('app-123');
      expect(sanitized.appName).toBe('ElseSourav Suite');
      expect(sanitized.password).toBe('[REDACTED_SECRET]');
      expect(sanitized.token).toBe('[REDACTED_SECRET]');
      expect(sanitized.api_key).toBe('[REDACTED_SECRET]');
      expect(sanitized.refreshToken).toBe('[REDACTED_SECRET]');
      expect(sanitized.authorization).toBe('[REDACTED_SECRET]');

      const nested = sanitized.nestedData as Record<string, unknown>;
      expect(nested.userEmail).toBe('admin@elsesourav.com');
      expect(nested.validConfig).toBe('enabled');
      expect(nested.clientSecret).toBe('[REDACTED_SECRET]');
    });
  });

  describe('recordAuditEvent', () => {
    it('records sanitized audit events for authorized admin operations', async () => {
      const mockRepo = {
        logAction: vi.fn().mockResolvedValue({
          id: 'log-1',
          userId: 'admin-1',
          action: 'APP_PUBLISHED',
          entityType: 'APP',
          entityId: 'app-123',
          details: { version: '1.0.0' },
          timestamp: Date.now(),
        }),
      } as unknown as AuditRepository;

      const service = new AuditService(mockRepo);

      await service.recordAuditEvent({
        actorUserId: 'admin-1',
        action: 'APP_PUBLISHED',
        resourceType: 'APP',
        resourceId: 'app-123',
        details: {
          version: '1.0.0',
          apiKey: 'should-be-removed',
        },
      });

      expect(mockRepo.logAction).toHaveBeenCalledWith({
        userId: 'admin-1',
        action: 'APP_PUBLISHED',
        entityType: 'APP',
        entityId: 'app-123',
        details: {
          version: '1.0.0',
          apiKey: '[REDACTED_SECRET]',
        },
        ipAddress: undefined,
        userAgent: undefined,
      });
    });

    it('safely catches non-critical logging errors without crashing business logic', async () => {
      const mockRepo = {
        logAction: vi.fn().mockRejectedValue(new Error('Database disk full')),
      } as unknown as AuditRepository;

      const service = new AuditService(mockRepo);

      // Should not throw error
      await expect(
        service.recordAuditEvent({
          actorUserId: 'admin-1',
          action: 'USER_ROLE_CHANGED',
          resourceType: 'USER',
          resourceId: 'user-2',
        })
      ).resolves.toBeUndefined();
    });
  });

  describe('listAuditLogsAdmin & Summary Authorization', () => {
    it('allows ADMIN to view paginated audit logs', async () => {
      const mockRepo = {
        findLogs: vi.fn().mockResolvedValue({
          logs: [
            {
              id: 'log-1',
              userId: 'admin-1',
              action: 'USER_ROLE_CHANGED',
              entityType: 'USER',
              entityId: 'user-99',
              timestamp: Date.now(),
            },
          ],
          total: 1,
        }),
      } as unknown as AuditRepository;

      const service = new AuditService(mockRepo);
      const result = await service.listAuditLogsAdmin('ADMIN', { page: 1, limit: 50 });

      expect(result.logs.length).toBe(1);
      expect(result.total).toBe(1);
      expect(result.totalPages).toBe(1);
    });

    it('allows STAFF to view audit logs and metrics', async () => {
      const mockRepo = {
        getSummaryMetrics: vi.fn().mockResolvedValue({
          totalLogs: 42,
          logsLast24Hours: 5,
          securityAlertsCount: 0,
          uniqueActorsCount: 3,
        }),
      } as unknown as AuditRepository;

      const service = new AuditService(mockRepo);
      const metrics = await service.getAuditSummaryMetrics('STAFF');

      expect(metrics.totalLogs).toBe(42);
      expect(metrics.uniqueActorsCount).toBe(3);
    });

    it('strictly forbids normal USER from viewing audit logs', async () => {
      const mockRepo = {
        findLogs: vi.fn(),
      } as unknown as AuditRepository;

      const service = new AuditService(mockRepo);

      await expect(service.listAuditLogsAdmin('USER')).rejects.toThrowError(AppError);
      expect(mockRepo.findLogs).not.toHaveBeenCalled();
    });
  });
});
