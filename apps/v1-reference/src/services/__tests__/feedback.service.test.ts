import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FeedbackService } from '../feedback.service';
import type { IFeedbackRepository } from '@/repositories';
import type { AppFeedback, AppRatingAggregate } from '@/types/feedback.types';
import { ok } from '@/lib/result';
import { submitFeedbackSchema } from '@/schemas/feedback.schema';
import { analyticsService } from '@/services/analytics.service';

vi.mock('@/services/analytics.service', () => ({
  analyticsService: {
    trackFeedbackSubmit: vi.fn().mockResolvedValue(undefined),
  },
}));

describe('FeedbackService & App Rating/Feedback System', () => {
  let mockFeedbackRepo: IFeedbackRepository;
  let feedbackService: FeedbackService;

  const mockPendingFeedback: AppFeedback = {
    id: 'user-123_app-calc',
    userId: 'user-123',
    appId: 'app-calc',
    rating: 5,
    message: 'Outstanding scientific calculator!',
    userDisplayName: 'Sourav',
    status: 'pending',
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
  };

  const mockApprovedFeedback: AppFeedback = {
    ...mockPendingFeedback,
    id: 'user-456_app-calc',
    userId: 'user-456',
    rating: 4,
    message: 'Very clean UI and responsive calculations.',
    status: 'approved',
    moderatedAt: 1700050000000,
    moderatedBy: 'admin-1',
  };

  const mockHiddenFeedback: AppFeedback = {
    ...mockPendingFeedback,
    id: 'user-789_app-calc',
    userId: 'user-789',
    status: 'hidden',
    moderatedAt: 1700060000000,
  };

  const mockRatingAggregate: AppRatingAggregate = {
    id: 'app-calc',
    appId: 'app-calc',
    ratingCount: 2,
    averageRating: 4.5,
    distribution: { 1: 0, 2: 0, 3: 0, 4: 1, 5: 1 },
    updatedAt: 1700050000000,
  };

  beforeEach(() => {
    mockFeedbackRepo = {
      getDeterministicId: vi.fn((userId, appId) => `${userId}_${appId}`),
      submitFeedback: vi.fn().mockResolvedValue(ok(mockPendingFeedback)),
      updateFeedback: vi.fn().mockResolvedValue(ok(mockPendingFeedback)),
      getUserFeedback: vi.fn().mockResolvedValue(ok(null)),
      listApprovedByApp: vi.fn().mockResolvedValue(
        ok({
          items: [mockApprovedFeedback],
          hasMore: false,
        })
      ),
      listAllForModeration: vi.fn().mockResolvedValue(
        ok({
          items: [mockPendingFeedback, mockApprovedFeedback, mockHiddenFeedback],
          hasMore: false,
        })
      ),
      moderate: vi.fn().mockResolvedValue(ok(mockApprovedFeedback)),
      deleteFeedback: vi.fn().mockResolvedValue(ok(undefined)),
      getAppRatingAggregate: vi.fn().mockResolvedValue(ok(mockRatingAggregate)),
      updateAppRatingAggregate: vi.fn().mockResolvedValue(ok(mockRatingAggregate)),
    };

    feedbackService = new FeedbackService(mockFeedbackRepo);
  });

  describe('1. Rating & Feedback Submission', () => {
    it('allows authenticated user to submit a 1-5 integer rating and review', async () => {
      const result = await feedbackService.submitRatingAndReview(
        'user-123',
        {
          appId: 'app-calc',
          rating: 5,
          message: 'Outstanding scientific calculator!',
        },
        { displayName: 'Sourav' }
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.rating).toBe(5);
        expect(result.data.status).toBe('pending');
      }

      expect(mockFeedbackRepo.submitFeedback).toHaveBeenCalledWith(
        'user-123',
        expect.objectContaining({ appId: 'app-calc', rating: 5 }),
        { displayName: 'Sourav' }
      );

      expect(analyticsService.trackFeedbackSubmit).toHaveBeenCalledWith('app-calc', 'user-123');
    });

    it('rejects unauthenticated user submissions', async () => {
      const result = await feedbackService.submitRatingAndReview('', {
        appId: 'app-calc',
        rating: 5,
        message: 'Great app!',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('UNAUTHORIZED');
      }
      expect(mockFeedbackRepo.submitFeedback).not.toHaveBeenCalled();
    });

    it('rejects invalid ratings outside 1-5 or non-integer values', () => {
      // Rating 0
      const parseZero = submitFeedbackSchema.safeParse({
        appId: 'app-calc',
        rating: 0,
        message: 'Invalid zero rating',
      });
      expect(parseZero.success).toBe(false);

      // Rating 6
      const parseSix = submitFeedbackSchema.safeParse({
        appId: 'app-calc',
        rating: 6,
        message: 'Invalid high rating',
      });
      expect(parseSix.success).toBe(false);

      // Decimal rating 4.5
      const parseDecimal = submitFeedbackSchema.safeParse({
        appId: 'app-calc',
        rating: 4.5,
        message: 'Invalid decimal rating',
      });
      expect(parseDecimal.success).toBe(false);
    });

    it('updates existing feedback instead of duplicating when user resubmits', async () => {
      vi.mocked(mockFeedbackRepo.getUserFeedback).mockResolvedValue(ok(mockPendingFeedback));

      const updatedRecord: AppFeedback = {
        ...mockPendingFeedback,
        rating: 4,
        message: 'Updated review note after version update',
      };
      vi.mocked(mockFeedbackRepo.submitFeedback).mockResolvedValue(ok(updatedRecord));

      const result = await feedbackService.submitRatingAndReview('user-123', {
        appId: 'app-calc',
        rating: 4,
        message: 'Updated review note after version update',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.rating).toBe(4);
      }
      expect(mockFeedbackRepo.updateAppRatingAggregate).toHaveBeenCalledWith('app-calc', 5, 4);
    });
  });

  describe('2. Moderation Workflow & Public Visibility', () => {
    it('returns only approved feedback in public query (pending & hidden are excluded)', async () => {
      const result = await feedbackService.getApprovedReviews('app-calc');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.items).toHaveLength(1);
        expect(result.data.items[0]?.status).toBe('approved');
      }
      expect(mockFeedbackRepo.listApprovedByApp).toHaveBeenCalledWith('app-calc', undefined);
    });

    it('allows admin to moderate review from pending to approved', async () => {
      const result = await feedbackService.moderateReview(
        'user-123_app-calc',
        'approved',
        'admin-1'
      );

      expect(result.success).toBe(true);
      expect(mockFeedbackRepo.moderate).toHaveBeenCalledWith(
        'user-123_app-calc',
        'approved',
        'admin-1'
      );
    });

    it('rejects moderation when admin credentials are missing', async () => {
      const result = await feedbackService.moderateReview('user-123_app-calc', 'approved', '');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('UNAUTHORIZED');
      }
    });
  });

  describe('3. Aggregate Statistics & Resilience', () => {
    it('retrieves app rating aggregate with average and distribution', async () => {
      const result = await feedbackService.getAppRatingAggregate('app-calc');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data?.averageRating).toBe(4.5);
        expect(result.data?.ratingCount).toBe(2);
        expect(result.data?.distribution[5]).toBe(1);
        expect(result.data?.distribution[4]).toBe(1);
      }
    });

    it('does not fail feedback submission if analytics throws', async () => {
      vi.mocked(analyticsService.trackFeedbackSubmit).mockRejectedValue(
        new Error('Network error logging telemetry')
      );

      const result = await feedbackService.submitRatingAndReview('user-123', {
        appId: 'app-calc',
        rating: 5,
        message: 'Great app!',
      });

      expect(result.success).toBe(true);
    });

    it('updates aggregate statistics on review deletion', async () => {
      vi.mocked(mockFeedbackRepo.getUserFeedback).mockResolvedValue(ok(mockApprovedFeedback));

      const result = await feedbackService.deleteReview('user-456', 'app-calc');

      expect(result.success).toBe(true);
      expect(mockFeedbackRepo.deleteFeedback).toHaveBeenCalledWith('user-456', 'app-calc');
      expect(mockFeedbackRepo.updateAppRatingAggregate).toHaveBeenCalledWith('app-calc', 4, null);
    });
  });
});
