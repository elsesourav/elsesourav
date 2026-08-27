import type { AnalyticsEvent, AppAnalyticsAggregate } from '@/types/analytics.types';
import type { AppActionType, AppPlatform } from '@/types/app.types';
import type { Result } from '@/types/result.types';
import type { AppError } from '@/lib/errors';
import type { PaginatedResult, QueryOptions } from '@/repositories/types';
import {
  analyticsRepository,
  type IAnalyticsRepository,
  type CreateAnalyticsEventDto,
} from '@/repositories';
import { getAnonymousSessionId } from '@/utils/session';

export interface TrackViewOptions {
  userId?: string;
  source?: string;
  metadata?: Record<string, unknown>;
}

export interface TrackActionOptions {
  platform?: AppPlatform;
  linkId?: string;
  userId?: string;
  source?: string;
  metadata?: Record<string, unknown>;
}

export interface IAnalyticsService {
  trackView(appId: string, options?: TrackViewOptions): Promise<void>;
  trackPrimaryAction(
    appId: string,
    action: AppActionType,
    options?: TrackActionOptions
  ): Promise<void>;
  trackExternalLink(appId: string, linkId: string, options?: TrackActionOptions): Promise<void>;
  trackLibraryAdd(appId: string, userId?: string): Promise<void>;
  trackLibraryRemove(appId: string, userId?: string): Promise<void>;
  trackFeedbackSubmit(appId: string, userId?: string): Promise<void>;
  getAppStats(appId: string): Promise<Result<AppAnalyticsAggregate | null, AppError>>;
  listEvents(
    appId?: string,
    options?: QueryOptions
  ): Promise<Result<PaginatedResult<AnalyticsEvent>, AppError>>;
}

export class AnalyticsService implements IAnalyticsService {
  constructor(private readonly analyticsRepo: IAnalyticsRepository = analyticsRepository) {}

  /**
   * Non-blocking view tracking
   */
  public async trackView(appId: string, options?: TrackViewOptions): Promise<void> {
    if (!appId || typeof appId !== 'string') return;

    try {
      const sessionId = getAnonymousSessionId();
      const eventDto: CreateAnalyticsEventDto = {
        appId,
        eventType: 'view',
        userId: options?.userId,
        sessionId,
        source: options?.source,
        metadata: options?.metadata,
      };

      await Promise.allSettled([
        this.analyticsRepo.logEvent(eventDto),
        this.analyticsRepo.incrementStats(appId, 'views', 1),
      ]);
    } catch {
      // Non-blocking: analytics failures must never interrupt user experience
    }
  }

  /**
   * Non-blocking primary action tracking (e.g. Open App, Add to Chrome, Download)
   */
  public async trackPrimaryAction(
    appId: string,
    action: AppActionType,
    options?: TrackActionOptions
  ): Promise<void> {
    if (!appId || !action) return;

    try {
      const sessionId = getAnonymousSessionId();
      const eventDto: CreateAnalyticsEventDto = {
        appId,
        eventType: 'primary_action',
        action,
        platform: options?.platform,
        linkId: options?.linkId,
        userId: options?.userId,
        sessionId,
        source: options?.source,
        metadata: options?.metadata,
      };

      await Promise.allSettled([
        this.analyticsRepo.logEvent(eventDto),
        this.analyticsRepo.incrementStats(appId, 'actions', 1),
      ]);
    } catch {
      // Non-blocking
    }
  }

  /**
   * Non-blocking external link click tracking
   */
  public async trackExternalLink(
    appId: string,
    linkId: string,
    options?: TrackActionOptions
  ): Promise<void> {
    if (!appId || !linkId) return;

    try {
      const sessionId = getAnonymousSessionId();
      const eventDto: CreateAnalyticsEventDto = {
        appId,
        eventType: 'external_link',
        linkId,
        platform: options?.platform,
        userId: options?.userId,
        sessionId,
        source: options?.source,
        metadata: options?.metadata,
      };

      await this.analyticsRepo.logEvent(eventDto);
    } catch {
      // Non-blocking
    }
  }

  /**
   * Non-blocking library save tracking
   */
  public async trackLibraryAdd(appId: string, userId?: string): Promise<void> {
    if (!appId) return;

    try {
      const sessionId = getAnonymousSessionId();
      const eventDto: CreateAnalyticsEventDto = {
        appId,
        eventType: 'library_add',
        userId,
        sessionId,
      };

      await Promise.allSettled([
        this.analyticsRepo.logEvent(eventDto),
        this.analyticsRepo.incrementStats(appId, 'library', 1),
      ]);
    } catch {
      // Non-blocking
    }
  }

  /**
   * Non-blocking library remove tracking
   */
  public async trackLibraryRemove(appId: string, userId?: string): Promise<void> {
    if (!appId) return;

    try {
      const sessionId = getAnonymousSessionId();
      const eventDto: CreateAnalyticsEventDto = {
        appId,
        eventType: 'library_remove',
        userId,
        sessionId,
      };

      await Promise.allSettled([
        this.analyticsRepo.logEvent(eventDto),
        this.analyticsRepo.incrementStats(appId, 'library', -1),
      ]);
    } catch {
      // Non-blocking
    }
  }

  /**
   * Non-blocking feedback submit tracking
   */
  public async trackFeedbackSubmit(appId: string, userId?: string): Promise<void> {
    if (!appId) return;

    try {
      const sessionId = getAnonymousSessionId();
      const eventDto: CreateAnalyticsEventDto = {
        appId,
        eventType: 'feedback_submit',
        userId,
        sessionId,
      };

      await Promise.allSettled([
        this.analyticsRepo.logEvent(eventDto),
        this.analyticsRepo.incrementStats(appId, 'feedback', 1),
      ]);
    } catch {
      // Non-blocking
    }
  }

  /**
   * Public/Admin stats aggregate retrieval
   */
  public async getAppStats(appId: string): Promise<Result<AppAnalyticsAggregate | null, AppError>> {
    return this.analyticsRepo.getAppStats(appId);
  }

  /**
   * Admin-only detailed event queries
   */
  public async listEvents(
    appId?: string,
    options?: QueryOptions
  ): Promise<Result<PaginatedResult<AnalyticsEvent>, AppError>> {
    return this.analyticsRepo.listEvents(appId, options);
  }
}

export const analyticsService = new AnalyticsService();
