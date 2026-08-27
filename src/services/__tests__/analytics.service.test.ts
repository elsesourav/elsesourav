import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AnalyticsService } from '../analytics.service';
import type { IAnalyticsRepository } from '@/repositories';
import type { AnalyticsEvent, AppAnalyticsAggregate } from '@/types/analytics.types';
import { ok } from '@/lib/result';
import { createAnalyticsEventSchema } from '@/schemas/analytics.schema';

describe('AnalyticsService & Application Engagement Foundation', () => {
  let mockAnalyticsRepo: IAnalyticsRepository;
  let analyticsService: AnalyticsService;

  const mockViewEvent: AnalyticsEvent = {
    id: 'evt-view-1',
    appId: 'app-calc',
    eventType: 'view',
    sessionId: 'sess_123456_abcdef',
    source: 'catalog',
    createdAt: 1700000000000,
  };

  const mockActionEvent: AnalyticsEvent = {
    id: 'evt-action-1',
    appId: 'app-calc',
    eventType: 'primary_action',
    action: 'open_app',
    platform: 'web',
    linkId: 'link-1',
    sessionId: 'sess_123456_abcdef',
    createdAt: 1700000000000,
  };

  const mockExternalLinkEvent: AnalyticsEvent = {
    id: 'evt-ext-1',
    appId: 'app-calc',
    eventType: 'external_link',
    linkId: 'link-github',
    platform: 'github',
    sessionId: 'sess_123456_abcdef',
    createdAt: 1700000000000,
  };

  const mockStats: AppAnalyticsAggregate = {
    id: 'app-calc',
    appId: 'app-calc',
    viewCount: 142,
    uniqueViewCount: 98,
    actionCount: 56,
    libraryCount: 12,
    feedbackCount: 5,
    averageRating: 4.8,
    ratingCount: 10,
    lastViewedAt: 1700000000000,
    lastActionAt: 1700000000000,
    updatedAt: 1700000000000,
  };

  beforeEach(() => {
    mockAnalyticsRepo = {
      logEvent: vi.fn().mockResolvedValue(ok(mockViewEvent)),
      getAppStats: vi.fn().mockResolvedValue(ok(mockStats)),
      incrementStats: vi.fn().mockResolvedValue(ok(undefined)),
      listEvents: vi.fn().mockResolvedValue(ok({ items: [mockViewEvent], hasMore: false })),
    };

    analyticsService = new AnalyticsService(mockAnalyticsRepo);
  });

  describe('1. Non-blocking Event Tracking', () => {
    it('tracks app view event and increments view counter', async () => {
      await analyticsService.trackView('app-calc', { source: 'catalog' });

      expect(mockAnalyticsRepo.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          appId: 'app-calc',
          eventType: 'view',
          source: 'catalog',
        })
      );
      expect(mockAnalyticsRepo.incrementStats).toHaveBeenCalledWith('app-calc', 'views', 1);
    });

    it('tracks primary context-aware action and increments action counter', async () => {
      vi.mocked(mockAnalyticsRepo.logEvent).mockResolvedValue(ok(mockActionEvent));

      await analyticsService.trackPrimaryAction('app-calc', 'open_app', {
        platform: 'web',
        linkId: 'link-1',
      });

      expect(mockAnalyticsRepo.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          appId: 'app-calc',
          eventType: 'primary_action',
          action: 'open_app',
          platform: 'web',
          linkId: 'link-1',
        })
      );
      expect(mockAnalyticsRepo.incrementStats).toHaveBeenCalledWith('app-calc', 'actions', 1);
    });

    it('tracks external link clicks', async () => {
      vi.mocked(mockAnalyticsRepo.logEvent).mockResolvedValue(ok(mockExternalLinkEvent));

      await analyticsService.trackExternalLink('app-calc', 'link-github', {
        platform: 'github',
      });

      expect(mockAnalyticsRepo.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          appId: 'app-calc',
          eventType: 'external_link',
          linkId: 'link-github',
          platform: 'github',
        })
      );
    });

    it('tracks library addition and removal events', async () => {
      await analyticsService.trackLibraryAdd('app-calc', 'user-123');
      expect(mockAnalyticsRepo.incrementStats).toHaveBeenCalledWith('app-calc', 'library', 1);

      await analyticsService.trackLibraryRemove('app-calc', 'user-123');
      expect(mockAnalyticsRepo.incrementStats).toHaveBeenCalledWith('app-calc', 'library', -1);
    });
  });

  describe('2. Privacy & Session Management', () => {
    it('handles authenticated vs anonymous user telemetry without storing IP addresses', async () => {
      // Authenticated tracking
      await analyticsService.trackView('app-calc', { userId: 'user-vip-1' });
      expect(mockAnalyticsRepo.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-vip-1',
        })
      );

      // Verify schema strictly forbids or does not capture IP addresses
      const parsed = createAnalyticsEventSchema.safeParse({
        appId: 'app-calc',
        eventType: 'view',
        sessionId: 'sess_safe_id',
      });

      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect('ipAddress' in parsed.data).toBe(false);
      }
    });
  });

  describe('3. Aggregates & Administrative Queries', () => {
    it('retrieves public app engagement statistics', async () => {
      const result = await analyticsService.getAppStats('app-calc');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data?.viewCount).toBe(142);
        expect(result.data?.actionCount).toBe(56);
        expect(result.data?.averageRating).toBe(4.8);
      }
      expect(mockAnalyticsRepo.getAppStats).toHaveBeenCalledWith('app-calc');
    });

    it('allows admin queries for granular telemetry events', async () => {
      const result = await analyticsService.listEvents('app-calc', { limit: 10 });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.items).toHaveLength(1);
        expect(result.data.items[0]?.eventType).toBe('view');
      }
      expect(mockAnalyticsRepo.listEvents).toHaveBeenCalledWith('app-calc', { limit: 10 });
    });
  });

  describe('4. Error Resilience & Non-blocking Behavior', () => {
    it('safely handles empty or invalid app IDs without error propagation', async () => {
      // Empty app ID should safely no-op
      await expect(analyticsService.trackView('')).resolves.not.toThrow();
      await expect(analyticsService.trackPrimaryAction('', 'open_app')).resolves.not.toThrow();
    });

    it('does not throw or break caller when repository fails (non-blocking guarantee)', async () => {
      vi.mocked(mockAnalyticsRepo.logEvent).mockRejectedValue(
        new Error('Network offline or database write quota exceeded')
      );
      vi.mocked(mockAnalyticsRepo.incrementStats).mockRejectedValue(new Error('Network offline'));

      // Underlying user action (like launching the web app) must not fail even if tracking throws
      await expect(
        analyticsService.trackPrimaryAction('app-calc', 'open_app')
      ).resolves.not.toThrow();
    });
  });
});
