import type {
  AppFeedback,
  AppRatingAggregate,
  FeedbackModerationStatus,
} from '@/types/feedback.types';
import type { Result } from '@/types/result.types';
import type { AppError } from '@/lib/errors';
import type { PaginatedResult, QueryOptions } from '@/repositories/types';
import {
  feedbackRepository,
  type IFeedbackRepository,
  type SubmitFeedbackDto,
  type UpdateFeedbackDto,
} from '@/repositories';
import { analyticsService } from '@/services/analytics.service';
import { isErr, err } from '@/lib/result';
import { AppError as ErrorFactory } from '@/lib/errors';

export type { SubmitFeedbackDto, UpdateFeedbackDto };

export interface IFeedbackService {
  submitRatingAndReview(
    userId: string,
    data: SubmitFeedbackDto,
    userInfo?: { displayName?: string; photoUrl?: string }
  ): Promise<Result<AppFeedback, AppError>>;
  updateRatingAndReview(
    userId: string,
    appId: string,
    data: UpdateFeedbackDto
  ): Promise<Result<AppFeedback, AppError>>;
  getUserReview(userId: string, appId: string): Promise<Result<AppFeedback | null, AppError>>;
  getApprovedReviews(
    appId: string,
    options?: QueryOptions
  ): Promise<Result<PaginatedResult<AppFeedback>, AppError>>;
  listReviewsForModeration(
    options?: QueryOptions
  ): Promise<Result<PaginatedResult<AppFeedback>, AppError>>;
  moderateReview(
    feedbackId: string,
    status: FeedbackModerationStatus,
    adminId: string
  ): Promise<Result<AppFeedback, AppError>>;
  deleteReview(userId: string, appId: string): Promise<Result<void, AppError>>;
  getAppRatingAggregate(appId: string): Promise<Result<AppRatingAggregate | null, AppError>>;
}

export class FeedbackService implements IFeedbackService {
  constructor(private readonly feedbackRepo: IFeedbackRepository = feedbackRepository) {}

  public async submitRatingAndReview(
    userId: string,
    data: SubmitFeedbackDto,
    userInfo?: { displayName?: string; photoUrl?: string }
  ): Promise<Result<AppFeedback, AppError>> {
    if (!userId) {
      return err(ErrorFactory.unauthorized('You must be signed in to submit a rating and review'));
    }

    const existingResult = await this.feedbackRepo.getUserFeedback(userId, data.appId);
    const oldRating =
      existingResult.success && existingResult.data ? existingResult.data.rating : null;

    const result = await this.feedbackRepo.submitFeedback(userId, data, userInfo);
    if (isErr(result)) {
      return result;
    }

    // Update aggregate atomically
    void this.feedbackRepo.updateAppRatingAggregate(data.appId, oldRating, data.rating);

    // Non-blocking telemetry event
    void analyticsService.trackFeedbackSubmit(data.appId, userId);

    return result;
  }

  public async updateRatingAndReview(
    userId: string,
    appId: string,
    data: UpdateFeedbackDto
  ): Promise<Result<AppFeedback, AppError>> {
    if (!userId) {
      return err(ErrorFactory.unauthorized('You must be signed in to update your review'));
    }

    const existingResult = await this.feedbackRepo.getUserFeedback(userId, appId);
    const oldRating =
      existingResult.success && existingResult.data ? existingResult.data.rating : null;

    const result = await this.feedbackRepo.updateFeedback(userId, appId, data);
    if (isErr(result)) {
      return result;
    }

    if (data.rating !== undefined && data.rating !== oldRating) {
      void this.feedbackRepo.updateAppRatingAggregate(appId, oldRating, data.rating);
    }

    return result;
  }

  public async getUserReview(
    userId: string,
    appId: string
  ): Promise<Result<AppFeedback | null, AppError>> {
    if (!userId || !appId) {
      return err(ErrorFactory.badRequest('User ID and App ID are required', 'appId'));
    }
    return this.feedbackRepo.getUserFeedback(userId, appId);
  }

  public async getApprovedReviews(
    appId: string,
    options?: QueryOptions
  ): Promise<Result<PaginatedResult<AppFeedback>, AppError>> {
    if (!appId) {
      return err(ErrorFactory.badRequest('App ID is required', 'appId'));
    }
    return this.feedbackRepo.listApprovedByApp(appId, options);
  }

  public async listReviewsForModeration(
    options?: QueryOptions
  ): Promise<Result<PaginatedResult<AppFeedback>, AppError>> {
    return this.feedbackRepo.listAllForModeration(options);
  }

  public async moderateReview(
    feedbackId: string,
    status: FeedbackModerationStatus,
    adminId: string
  ): Promise<Result<AppFeedback, AppError>> {
    if (!adminId) {
      return err(ErrorFactory.unauthorized('Admin credentials required for moderation'));
    }
    return this.feedbackRepo.moderate(feedbackId, status, adminId);
  }

  public async deleteReview(userId: string, appId: string): Promise<Result<void, AppError>> {
    if (!userId || !appId) {
      return err(ErrorFactory.badRequest('User ID and App ID are required', 'appId'));
    }

    const existingResult = await this.feedbackRepo.getUserFeedback(userId, appId);
    const oldRating =
      existingResult.success && existingResult.data ? existingResult.data.rating : null;

    const result = await this.feedbackRepo.deleteFeedback(userId, appId);
    if (isErr(result)) {
      return result;
    }

    if (oldRating !== null) {
      void this.feedbackRepo.updateAppRatingAggregate(appId, oldRating, null);
    }

    return result;
  }

  public async getAppRatingAggregate(
    appId: string
  ): Promise<Result<AppRatingAggregate | null, AppError>> {
    return this.feedbackRepo.getAppRatingAggregate(appId);
  }
}

export const feedbackService = new FeedbackService();
