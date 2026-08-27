import { useState, useCallback, useEffect } from 'react';
import { useAuth } from './useAuth';
import { feedbackService } from '@/services/feedback.service';
import type { AppFeedback, AppRatingAggregate } from '@/types/feedback.types';
import type { AppError } from '@/lib/errors';
import type { Result } from '@/types/result.types';
import { isErr, err } from '@/lib/result';
import { AppError as ErrorFactory } from '@/lib/errors';

export interface UseAppFeedbackReturn {
  userReview: AppFeedback | null;
  approvedReviews: AppFeedback[];
  ratingAggregate: AppRatingAggregate | null;
  isLoading: boolean;
  isSubmitting: boolean;
  submitReview: (rating: number, message: string) => Promise<Result<AppFeedback, AppError>>;
  deleteReview: () => Promise<Result<void, AppError>>;
  refreshReviews: () => Promise<void>;
}

export function useAppFeedback(appId: string): UseAppFeedbackReturn {
  const { user, authUser, isAuthenticated } = useAuth();
  const userId = user?.id || authUser?.uid;

  const [userReview, setUserReview] = useState<AppFeedback | null>(null);
  const [approvedReviews, setApprovedReviews] = useState<AppFeedback[]>([]);
  const [ratingAggregate, setRatingAggregate] = useState<AppRatingAggregate | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const refreshReviews = useCallback(async () => {
    if (!appId) return;

    setIsLoading(true);
    try {
      const [approvedResult, aggregateResult, userResult] = await Promise.all([
        feedbackService.getApprovedReviews(appId),
        feedbackService.getAppRatingAggregate(appId),
        userId ? feedbackService.getUserReview(userId, appId) : Promise.resolve(null),
      ]);

      if (!isErr(approvedResult)) {
        setApprovedReviews([...approvedResult.data.items]);
      }

      if (!isErr(aggregateResult)) {
        setRatingAggregate(aggregateResult.data);
      }

      if (userResult && !isErr(userResult)) {
        setUserReview(userResult.data);
      }
    } finally {
      setIsLoading(false);
    }
  }, [appId, userId]);

  useEffect(() => {
    void refreshReviews();
  }, [refreshReviews]);

  const submitReview = useCallback(
    async (rating: number, message: string): Promise<Result<AppFeedback, AppError>> => {
      if (!isAuthenticated || !userId) {
        return err(
          ErrorFactory.unauthorized('You must be signed in to submit a rating and review')
        );
      }

      setIsSubmitting(true);
      try {
        const result = await feedbackService.submitRatingAndReview(
          userId,
          {
            appId,
            rating,
            message,
          },
          {
            displayName: user?.displayName || authUser?.displayName || undefined,
            photoUrl: user?.photoUrl || authUser?.photoURL || undefined,
          }
        );

        if (!isErr(result)) {
          setUserReview(result.data);
          void refreshReviews();
        }

        return result;
      } finally {
        setIsSubmitting(false);
      }
    },
    [appId, isAuthenticated, userId, user, authUser, refreshReviews]
  );

  const deleteReview = useCallback(async (): Promise<Result<void, AppError>> => {
    if (!isAuthenticated || !userId) {
      return err(ErrorFactory.unauthorized('You must be signed in to delete your review'));
    }

    setIsSubmitting(true);
    try {
      const result = await feedbackService.deleteReview(userId, appId);
      if (!isErr(result)) {
        setUserReview(null);
        void refreshReviews();
      }
      return result;
    } finally {
      setIsSubmitting(false);
    }
  }, [appId, isAuthenticated, userId, refreshReviews]);

  return {
    userReview,
    approvedReviews,
    ratingAggregate,
    isLoading,
    isSubmitting,
    submitReview,
    deleteReview,
    refreshReviews,
  };
}
