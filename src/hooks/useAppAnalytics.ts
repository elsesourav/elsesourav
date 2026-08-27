import { useCallback } from 'react';
import {
  analyticsService,
  type TrackViewOptions,
  type TrackActionOptions,
} from '@/services/analytics.service';
import type { AppActionType } from '@/types/app.types';
import type { AppAnalyticsAggregate } from '@/types/analytics.types';
import type { AppError } from '@/lib/errors';
import type { Result } from '@/types/result.types';

export interface UseAppAnalyticsReturn {
  trackView: (appId: string, options?: TrackViewOptions) => Promise<void>;
  trackPrimaryAction: (
    appId: string,
    action: AppActionType,
    options?: TrackActionOptions
  ) => Promise<void>;
  trackExternalLink: (appId: string, linkId: string, options?: TrackActionOptions) => Promise<void>;
  trackLibraryAdd: (appId: string, userId?: string) => Promise<void>;
  trackLibraryRemove: (appId: string, userId?: string) => Promise<void>;
  trackFeedbackSubmit: (appId: string, userId?: string) => Promise<void>;
  getAppStats: (appId: string) => Promise<Result<AppAnalyticsAggregate | null, AppError>>;
}

export function useAppAnalytics(): UseAppAnalyticsReturn {
  const trackView = useCallback(async (appId: string, options?: TrackViewOptions) => {
    await analyticsService.trackView(appId, options);
  }, []);

  const trackPrimaryAction = useCallback(
    async (appId: string, action: AppActionType, options?: TrackActionOptions) => {
      await analyticsService.trackPrimaryAction(appId, action, options);
    },
    []
  );

  const trackExternalLink = useCallback(
    async (appId: string, linkId: string, options?: TrackActionOptions) => {
      await analyticsService.trackExternalLink(appId, linkId, options);
    },
    []
  );

  const trackLibraryAdd = useCallback(async (appId: string, userId?: string) => {
    await analyticsService.trackLibraryAdd(appId, userId);
  }, []);

  const trackLibraryRemove = useCallback(async (appId: string, userId?: string) => {
    await analyticsService.trackLibraryRemove(appId, userId);
  }, []);

  const trackFeedbackSubmit = useCallback(async (appId: string, userId?: string) => {
    await analyticsService.trackFeedbackSubmit(appId, userId);
  }, []);

  const getAppStats = useCallback(async (appId: string) => {
    return analyticsService.getAppStats(appId);
  }, []);

  return {
    trackView,
    trackPrimaryAction,
    trackExternalLink,
    trackLibraryAdd,
    trackLibraryRemove,
    trackFeedbackSubmit,
    getAppStats,
  };
}
