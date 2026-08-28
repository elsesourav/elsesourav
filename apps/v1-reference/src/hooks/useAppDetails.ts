import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { appService } from '@/services/app.service';
import { classificationService } from '@/services/classification.service';
import { appMediaService } from '@/services/media.service';
import { appVersionService } from '@/services/version.service';
import { feedbackService } from '@/services/feedback.service';
import { userLibraryService } from '@/services/library.service';
import type { App, AppLink } from '@/types/app.types';
import type { Category } from '@/types/category.types';
import type { Tag } from '@/types/tag.types';
import type { AppMedia } from '@/types/media.types';
import type { AppVersion } from '@/types/version.types';
import type { AppFeedback, AppRatingAggregate } from '@/types/feedback.types';
import { AppError } from '@/lib/errors';
import { isErr, ok } from '@/lib/result';

export interface AppDetailsData {
  app: App;
  category: Category | null;
  tags: Tag[];
  primaryAction: AppLink | null;
  links: AppLink[];
  media: {
    icon: AppMedia | null;
    hero: AppMedia | null;
    screenshots: AppMedia[];
    social: AppMedia | null;
    all: AppMedia[];
  };
  versions: {
    latest: AppVersion | null;
    all: AppVersion[];
  };
  ratings: {
    aggregate: AppRatingAggregate | null;
    approvedReviews: AppFeedback[];
    userReview: AppFeedback | null;
  };
  relatedApps: App[];
  isSaved: boolean;
}

export interface UseAppDetailsReturn {
  data: AppDetailsData | null;
  isLoading: boolean;
  error: AppError | null;
  refetch: () => Promise<void>;
}

export function useAppDetails(slugOrId?: string): UseAppDetailsReturn {
  const { user, authUser } = useAuth();
  const userId = user?.id || authUser?.uid;

  const [data, setData] = useState<AppDetailsData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(Boolean(slugOrId));
  const [error, setError] = useState<AppError | null>(null);

  const fetchAppDetails = useCallback(async () => {
    if (!slugOrId) {
      setData(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 1. Fetch App by slug or ID
      let appResult = await appService.getAppBySlug(slugOrId);
      if (isErr(appResult) || !appResult.data) {
        appResult = await appService.getAppById(slugOrId);
      }

      if (isErr(appResult) || !appResult.data) {
        setError(appResult.success ? AppError.notFound('App not found') : appResult.error);
        setData(null);
        return;
      }

      const app = appResult.data;
      const appId = app.id;

      // 2. Concurrently fetch related domain entities
      const [
        categoryResult,
        tagsResult,
        mediaResult,
        versionsResult,
        latestVersionResult,
        ratingAggregateResult,
        approvedReviewsResult,
        userReviewResult,
        relatedAppsResult,
        savedStateResult,
      ] = await Promise.all([
        classificationService.getCategoryBySlug(app.primaryCategory),
        classificationService.listActiveTags(),
        appMediaService.listMedia(appId),
        appVersionService.listVersions(appId),
        appVersionService.getLatestVersion(appId),
        feedbackService.getAppRatingAggregate(appId),
        feedbackService.getApprovedReviews(appId, { limit: 10 }),
        userId ? feedbackService.getUserReview(userId, appId) : Promise.resolve(null),
        appService.getRelatedApps(app.id, app.primaryCategory, app.tags, 3),
        userId ? userLibraryService.isAppSaved(userId, appId) : Promise.resolve(ok(false)),
      ]);

      const allMedia = !isErr(mediaResult) ? [...mediaResult.data.items] : [];
      const primaryAction =
        app.links.find((l) => l.isPrimary && l.isActive) ||
        app.links.find((l) => l.isActive) ||
        null;

      // Filter tags matching app's tag list
      const allTags = !isErr(tagsResult) ? [...tagsResult.data.items] : [];
      const appTags = allTags.filter((t) => app.tags.includes(t.slug) || app.tags.includes(t.name));

      // Related apps
      const relatedApps = !isErr(relatedAppsResult) ? [...relatedAppsResult.data] : [];

      const compositeData: AppDetailsData = {
        app,
        category: !isErr(categoryResult) ? categoryResult.data : null,
        tags: appTags,
        primaryAction,
        links: app.links.filter((l) => l.isActive),
        media: {
          icon: allMedia.find((m) => m.type === 'icon') || null,
          hero: allMedia.find((m) => m.type === 'hero') || null,
          screenshots: allMedia.filter((m) => m.type === 'screenshot'),
          social: allMedia.find((m) => m.type === 'social') || null,
          all: allMedia,
        },
        versions: {
          latest: !isErr(latestVersionResult) ? latestVersionResult.data : null,
          all: !isErr(versionsResult) ? [...versionsResult.data.items] : [],
        },
        ratings: {
          aggregate: !isErr(ratingAggregateResult) ? ratingAggregateResult.data : null,
          approvedReviews: !isErr(approvedReviewsResult)
            ? [...approvedReviewsResult.data.items]
            : [],
          userReview: userReviewResult && !isErr(userReviewResult) ? userReviewResult.data : null,
        },
        relatedApps,
        isSaved: !isErr(savedStateResult) ? Boolean(savedStateResult.data) : false,
      };

      setData(compositeData);
    } finally {
      setIsLoading(false);
    }
  }, [slugOrId, userId]);

  useEffect(() => {
    void fetchAppDetails();
  }, [fetchAppDetails]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchAppDetails,
  };
}
