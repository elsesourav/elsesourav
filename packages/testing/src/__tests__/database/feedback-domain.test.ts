import { describe, it, expect, vi } from 'vitest';
import { FeedbackService, FeedbackRepository, AppRepository } from '@elsesourav/database';
import { AppError } from '@elsesourav/types';
import type { App, AppFeedbackItem, AppFeedbackSummary } from '@elsesourav/types';
import type { PrismaClient } from '@elsesourav/database';

describe('Feedback Domain & Rating Foundation', () => {
  const mockApp: App = {
    id: 'app-breakout',
    slug: 'breakout-ball',
    name: 'Breakout Ball',
    shortDescription: 'Classic brick breaking retro game',
    description: 'Break bricks with physics-driven gameplay',
    iconUrl: 'https://example.com/breakout.png',
    screenshots: [],
    primaryCategory: 'games',
    tags: ['arcade', 'game'],
    status: 'published',
    platforms: ['web'],
    links: [],
    stats: { views: 500, launches: 200, libraryAdds: 40, ratingAverage: 4.8, ratingCount: 15 },
    isFeatured: true,
    isPinned: false,
    sortOrder: 1,
    createdAt: 1704067200000,
    updatedAt: 1704067200000,
  };

  const mockFeedbackItem: AppFeedbackItem = {
    id: 'fb-1',
    userId: 'user-1',
    appId: 'app-breakout',
    rating: 5,
    message: 'Remarkable physics and retro soundtrack!',
    status: 'approved',
    createdAt: 1704153600000,
    updatedAt: 1704153600000,
    user: {
      displayName: 'Alex Rivers',
      photoUrl: 'https://example.com/avatar.png',
      username: 'alexr',
    },
  };

  const mockSummary: AppFeedbackSummary = {
    averageRating: 4.8,
    totalCount: 15,
    distribution: { 1: 0, 2: 0, 3: 1, 4: 1, 5: 13 },
  };

  describe('FeedbackService Operations', () => {
    it('submits feedback for an existing application', async () => {
      const mockAppRepo = {
        findBySlug: vi.fn().mockResolvedValue(mockApp),
      } as unknown as AppRepository;

      const mockFeedbackRepo = {
        upsertFeedback: vi.fn().mockResolvedValue(mockFeedbackItem),
      } as unknown as FeedbackRepository;

      const service = new FeedbackService(mockFeedbackRepo, mockAppRepo);
      const result = await service.submitFeedback(
        'user-1',
        'breakout-ball',
        5,
        'Remarkable physics and retro soundtrack!'
      );

      expect(mockAppRepo.findBySlug).toHaveBeenCalledWith('breakout-ball');
      expect(mockFeedbackRepo.upsertFeedback).toHaveBeenCalledWith(
        'user-1',
        'app-breakout',
        5,
        'Remarkable physics and retro soundtrack!',
        undefined
      );
      expect(result.id).toBe('fb-1');
      expect(result.rating).toBe(5);
    });

    it('throws notFound error when submitting feedback for a non-existent app', async () => {
      const mockAppRepo = {
        findBySlug: vi.fn().mockResolvedValue(null),
      } as unknown as AppRepository;

      const mockFeedbackRepo = {
        upsertFeedback: vi.fn(),
      } as unknown as FeedbackRepository;

      const service = new FeedbackService(mockFeedbackRepo, mockAppRepo);

      await expect(service.submitFeedback('user-1', 'non-existent-app', 5)).rejects.toThrowError(
        AppError
      );
    });

    it('fetches paginated feedback, summary, and current user review', async () => {
      const mockAppRepo = {
        findBySlug: vi.fn().mockResolvedValue(mockApp),
      } as unknown as AppRepository;

      const mockFeedbackRepo = {
        listByApp: vi.fn().mockResolvedValue({
          items: [mockFeedbackItem],
          totalCount: 15,
        }),
        getAppFeedbackSummary: vi.fn().mockResolvedValue(mockSummary),
        getUserFeedback: vi.fn().mockResolvedValue(mockFeedbackItem),
      } as unknown as FeedbackRepository;

      const service = new FeedbackService(mockFeedbackRepo, mockAppRepo);
      const result = await service.getFeedbackForApp('breakout-ball', {
        page: 1,
        limit: 10,
        sort: 'newest',
        currentUserId: 'user-1',
      });

      expect(result.items).toHaveLength(1);
      expect(result.summary.averageRating).toBe(4.8);
      expect(result.summary.totalCount).toBe(15);
      expect(result.userFeedback?.id).toBe('fb-1');
      expect(result.page).toBe(1);
      expect(result.totalPages).toBe(2);
      expect(result.hasMore).toBe(true);
    });

    it('allows deleting a user review for an existing app', async () => {
      const mockAppRepo = {
        findBySlug: vi.fn().mockResolvedValue(mockApp),
      } as unknown as AppRepository;

      const mockFeedbackRepo = {
        deleteFeedback: vi.fn().mockResolvedValue(undefined),
      } as unknown as FeedbackRepository;

      const service = new FeedbackService(mockFeedbackRepo, mockAppRepo);
      await service.deleteFeedback('user-1', 'breakout-ball');

      expect(mockFeedbackRepo.deleteFeedback).toHaveBeenCalledWith('user-1', 'app-breakout');
    });

    it('throws notFound error when attempting to delete feedback for missing app', async () => {
      const mockAppRepo = {
        findBySlug: vi.fn().mockResolvedValue(null),
      } as unknown as AppRepository;

      const mockFeedbackRepo = {
        deleteFeedback: vi.fn(),
      } as unknown as FeedbackRepository;

      const service = new FeedbackService(mockFeedbackRepo, mockAppRepo);

      await expect(service.deleteFeedback('user-1', 'ghost-app')).rejects.toThrowError(AppError);
    });
  });

  describe('FeedbackRepository Query & Aggregation Contracts', () => {
    it('executes atomic feedback upsert and recalculates AppStat', async () => {
      const mockTx = {
        appFeedback: {
          upsert: vi.fn().mockResolvedValue({
            id: 'fb-1',
            userId: 'user-1',
            appId: 'app-breakout',
            rating: 5,
            message: 'Superb!',
            status: 'approved',
            createdAt: new Date('2026-01-01T00:00:00Z'),
            updatedAt: new Date('2026-01-01T00:00:00Z'),
            user: {
              displayName: 'Alex Rivers',
              photoUrl: null,
              username: 'alexr',
            },
          }),
          aggregate: vi.fn().mockResolvedValue({
            _avg: { rating: 4.8 },
            _count: { rating: 15 },
          }),
        },
        appStat: {
          upsert: vi.fn().mockResolvedValue({}),
        },
      };

      const mockPrisma = {
        user: {
          findFirst: vi.fn().mockResolvedValue({ id: 'user-1' }),
        },
        $transaction: vi
          .fn()
          .mockImplementation(async (cb: (tx: typeof mockTx) => Promise<unknown>) => cb(mockTx)),
      };

      const repo = new FeedbackRepository(mockPrisma as unknown as PrismaClient);
      const result = await repo.upsertFeedback('user-1', 'app-breakout', 5, 'Superb!');

      expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [{ id: 'user-1' }, { supabaseAuthId: 'user-1' }],
        },
        select: { id: true },
      });

      expect(mockTx.appFeedback.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId_appId: { userId: 'user-1', appId: 'app-breakout' } },
        })
      );
      expect(mockTx.appStat.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { appId: 'app-breakout' },
          create: expect.objectContaining({ ratingAverage: 4.8, ratingCount: 15 }),
        })
      );
      expect(result.id).toBe('fb-1');
      expect(result.rating).toBe(5);
    });

    it('aggregates star rating distribution properly', async () => {
      const mockPrisma = {
        appFeedback: {
          aggregate: vi.fn().mockResolvedValue({
            _avg: { rating: 4.5 },
            _count: { rating: 10 },
          }),
          groupBy: vi.fn().mockResolvedValue([
            { rating: 5, _count: { rating: 7 } },
            { rating: 4, _count: { rating: 2 } },
            { rating: 3, _count: { rating: 1 } },
          ]),
        },
      };

      const repo = new FeedbackRepository(mockPrisma as unknown as PrismaClient);
      const summary = await repo.getAppFeedbackSummary('app-breakout');

      expect(summary.averageRating).toBe(4.5);
      expect(summary.totalCount).toBe(10);
      expect(summary.distribution[5]).toBe(7);
      expect(summary.distribution[4]).toBe(2);
      expect(summary.distribution[3]).toBe(1);
      expect(summary.distribution[2]).toBe(0);
      expect(summary.distribution[1]).toBe(0);
    });

    it('tracks helpful likes and toggles votes in likeFeedback', async () => {
      const mockTx = {
        appFeedbackLike: {
          create: vi.fn().mockResolvedValue({ id: 'like-1' }),
          delete: vi.fn().mockResolvedValue({ id: 'like-1' }),
        },
        appFeedback: {
          update: vi
            .fn()
            .mockResolvedValueOnce({ helpfulCount: 4 })
            .mockResolvedValueOnce({ helpfulCount: 3 }),
          findUnique: vi.fn().mockResolvedValue({ helpfulCount: 4 }),
        },
      };

      const mockPrisma = {
        user: {
          findFirst: vi.fn().mockResolvedValue({ id: 'user-1' }),
        },
        appFeedbackLike: {
          findUnique: vi
            .fn()
            .mockResolvedValueOnce(null) // 1st call: not yet voted
            .mockResolvedValueOnce({ id: 'like-1' }), // 2nd call: already voted
        },
        $transaction: vi
          .fn()
          .mockImplementation(async (cb: (tx: typeof mockTx) => Promise<unknown>) => cb(mockTx)),
      };

      const repo = new FeedbackRepository(mockPrisma as unknown as PrismaClient);

      // First vote: successfully increments
      const firstVote = await repo.likeFeedback('fb-1', 'user:user-1', 'user-1');
      expect(firstVote.alreadyLiked).toBe(false);
      expect(firstVote.helpfulCount).toBe(4);
      expect(mockTx.appFeedbackLike.create).toHaveBeenCalledWith({
        data: {
          feedbackId: 'fb-1',
          identifier: 'user:user-1',
          userId: 'user-1',
        },
      });

      // Second vote: detected as already liked, toggles vote off (unlikes)
      const secondVote = await repo.likeFeedback('fb-1', 'user:user-1', 'user-1');
      expect(secondVote.alreadyLiked).toBe(true);
      expect(secondVote.hasLiked).toBe(false);
      expect(secondVote.helpfulCount).toBe(3);
    });

    it('toggles helpful votes: increments on first click and decrements on second click', async () => {
      const mockTx = {
        appFeedbackLike: {
          create: vi.fn().mockResolvedValue({ id: 'like-1' }),
          delete: vi.fn().mockResolvedValue({ id: 'like-1' }),
        },
        appFeedback: {
          update: vi
            .fn()
            .mockResolvedValueOnce({ helpfulCount: 4 })
            .mockResolvedValueOnce({ helpfulCount: 3 }),
          findUnique: vi.fn().mockResolvedValue({ helpfulCount: 4 }),
        },
      };

      const mockPrisma = {
        user: {
          findFirst: vi.fn().mockResolvedValue({ id: 'user-1' }),
        },
        appFeedbackLike: {
          findUnique: vi
            .fn()
            .mockResolvedValueOnce(null) // 1st call: not yet liked
            .mockResolvedValueOnce({ id: 'like-1' }), // 2nd call: already liked
        },
        $transaction: vi
          .fn()
          .mockImplementation(async (cb: (tx: typeof mockTx) => Promise<unknown>) => cb(mockTx)),
      };

      const repo = new FeedbackRepository(mockPrisma as unknown as PrismaClient);

      // First click: votes helpful (adds like)
      const firstVote = await repo.toggleHelpful('fb-1', 'user:user-1', 'user-1');
      expect(firstVote.hasLiked).toBe(true);
      expect(firstVote.helpfulCount).toBe(4);
      expect(mockTx.appFeedbackLike.create).toHaveBeenCalledWith({
        data: {
          feedbackId: 'fb-1',
          identifier: 'user:user-1',
          userId: 'user-1',
        },
      });

      // Second click: removes helpful vote (unlike)
      const secondVote = await repo.toggleHelpful('fb-1', 'user:user-1', 'user-1');
      expect(secondVote.hasLiked).toBe(false);
      expect(secondVote.helpfulCount).toBe(3);
      expect(mockTx.appFeedbackLike.delete).toHaveBeenCalledWith({
        where: { id: 'like-1' },
      });
    });
  });
});
