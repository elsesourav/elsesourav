import { FeedbackRepository } from '../repositories/feedback.repository';
import { AppRepository } from '../repositories/app.repository';
import { AppError } from '@elsesourav/types';
import type { AppFeedbackItem, FeedbackListResult, FeedbackSort } from '@elsesourav/types';

export class FeedbackService {
  constructor(
    private readonly feedbackRepo: FeedbackRepository = new FeedbackRepository(),
    private readonly appRepo: AppRepository = new AppRepository()
  ) {}

  /**
   * Submits or updates a user's feedback for an app identified by slug.
   * Returns the created/updated feedback item.
   */
  async submitFeedback(
    userId: string,
    appSlug: string,
    rating: number,
    message?: string,
    fallbackUser?: { email?: string; displayName?: string; photoUrl?: string }
  ): Promise<AppFeedbackItem> {
    // Resolve slug → id
    const app = await this.appRepo.findBySlug(appSlug);
    if (!app) {
      throw AppError.notFound('Application');
    }

    return this.feedbackRepo.upsertFeedback(userId, app.id, rating, message, fallbackUser);
  }

  /**
   * Returns a paginated, sorted feedback listing with summary and
   * the current user's own review (if authenticated).
   */
  async getFeedbackForApp(
    appSlug: string,
    options: {
      page?: number;
      limit?: number;
      sort?: FeedbackSort;
      currentUserId?: string;
      clientIdentifier?: string;
    } = {}
  ): Promise<FeedbackListResult> {
    const app = await this.appRepo.findBySlug(appSlug);
    if (!app) {
      throw AppError.notFound('Application');
    }

    const page = options.page ?? 1;
    const limit = options.limit ?? 10;
    const sort = options.sort ?? 'newest';

    const [listResult, summary, userFeedback] = await Promise.all([
      this.feedbackRepo.listByApp(app.id, page, limit, sort, options.clientIdentifier),
      this.feedbackRepo.getAppFeedbackSummary(app.id),
      options.currentUserId
        ? this.feedbackRepo.getUserFeedback(options.currentUserId, app.id)
        : Promise.resolve(undefined),
    ]);

    const totalPages = Math.ceil(listResult.totalCount / limit) || 1;

    return {
      items: listResult.items,
      summary,
      userFeedback: userFeedback ?? undefined,
      page,
      totalPages,
      hasMore: page < totalPages,
    };
  }

  /**
   * Deletes a user's own feedback for an app.
   */
  async deleteFeedback(userId: string, appSlug: string): Promise<void> {
    const app = await this.appRepo.findBySlug(appSlug);
    if (!app) {
      throw AppError.notFound('Application');
    }

    return this.feedbackRepo.deleteFeedback(userId, app.id);
  }

  /**
   * Toggles a helpful vote from a user or client identifier.
   * If already voted, removes the vote (unlike). If not, adds the vote.
   */
  async toggleHelpful(
    feedbackId: string,
    identifier: string,
    userId?: string
  ): Promise<{ helpfulCount: number; hasLiked: boolean }> {
    return this.feedbackRepo.toggleHelpful(feedbackId, identifier, userId);
  }

  /**
   * Backwards compatible likeFeedback method
   */
  async likeFeedback(
    feedbackId: string,
    identifier: string,
    userId?: string
  ): Promise<{ helpfulCount: number; alreadyLiked: boolean; hasLiked: boolean }> {
    return this.feedbackRepo.likeFeedback(feedbackId, identifier, userId);
  }
}
