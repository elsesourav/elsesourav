import { PrismaClient, Prisma } from '@prisma/client';
import { prisma as defaultPrisma } from '../client';
import { AppError } from '@elsesourav/types';
import type {
  AppFeedbackItem,
  AppFeedbackSummary,
  FeedbackSort,
  StarRating,
} from '@elsesourav/types';

/** Shape returned by Prisma when including the user relation */
interface PrismaFeedbackWithUser {
  id: string;
  userId: string;
  appId: string;
  rating: number;
  message: string | null;
  status: string;
  helpfulCount?: number;
  createdAt: Date;
  updatedAt: Date;
  user: {
    displayName: string;
    photoUrl: string | null;
    username: string | null;
  };
}

function mapToFeedbackItem(
  record: PrismaFeedbackWithUser,
  hasLiked: boolean = false
): AppFeedbackItem {
  return {
    id: record.id,
    userId: record.userId,
    appId: record.appId,
    rating: record.rating,
    message: record.message ?? undefined,
    status: record.status as AppFeedbackItem['status'],
    helpfulCount: record.helpfulCount ?? 0,
    hasLiked,
    createdAt: record.createdAt.getTime(),
    updatedAt: record.updatedAt.getTime(),
    user: {
      displayName: record.user.displayName,
      photoUrl: record.user.photoUrl ?? undefined,
      username: record.user.username ?? undefined,
    },
  };
}

export class FeedbackRepository {
  constructor(private readonly prisma: PrismaClient = defaultPrisma) {}

  private readonly feedbackInclude = {
    user: {
      select: {
        displayName: true,
        photoUrl: true,
        username: true,
      },
    },
  };

  /**
   * Resolves a user identifier (which may be internal User.id or Supabase auth UUID)
   * to the database User.id. If no user row exists, auto-creates a placeholder
   * profile so foreign key constraints are always satisfied.
   */
  async resolveDatabaseUserId(
    identifier: string,
    fallbackUser?: { email?: string; displayName?: string; photoUrl?: string }
  ): Promise<string> {
    const existing = await this.prisma.user.findFirst({
      where: {
        OR: [{ id: identifier }, { supabaseAuthId: identifier }],
      },
      select: { id: true },
    });

    if (existing) {
      return existing.id;
    }

    const created = await this.prisma.user.create({
      data: {
        supabaseAuthId: identifier,
        email: fallbackUser?.email || `${identifier}@user.local`,
        displayName: fallbackUser?.displayName || 'User',
        photoUrl: fallbackUser?.photoUrl || null,
        role: 'USER',
        preferences: {},
      },
      select: { id: true },
    });

    return created.id;
  }

  /**
   * Creates or updates a user's feedback for a specific app.
   * Uses the unique [userId, appId] constraint for idempotency.
   * Recalculates AppStat aggregates in the same transaction.
   */
  async upsertFeedback(
    userId: string,
    appId: string,
    rating: number,
    message?: string,
    fallbackUser?: { email?: string; displayName?: string; photoUrl?: string }
  ): Promise<AppFeedbackItem> {
    try {
      const resolvedUserId = await this.resolveDatabaseUserId(userId, fallbackUser);

      const result = await this.prisma.$transaction(async (tx) => {
        // 1. Upsert the feedback entry
        const feedback = await tx.appFeedback.upsert({
          where: { userId_appId: { userId: resolvedUserId, appId } },
          create: {
            userId: resolvedUserId,
            appId,
            rating,
            message: message?.trim() || null,
            status: 'approved',
          },
          update: {
            rating,
            message: message?.trim() || null,
          },
          include: this.feedbackInclude,
        });

        // 2. Recalculate aggregated stats
        const aggregation = await tx.appFeedback.aggregate({
          where: { appId, status: 'approved' },
          _avg: { rating: true },
          _count: { rating: true },
        });

        // 3. Update AppStat
        await tx.appStat.upsert({
          where: { appId },
          create: {
            appId,
            ratingAverage: aggregation._avg.rating ?? 0,
            ratingCount: aggregation._count.rating,
          },
          update: {
            ratingAverage: aggregation._avg.rating ?? 0,
            ratingCount: aggregation._count.rating,
          },
        });

        return feedback;
      });

      return mapToFeedbackItem(result as PrismaFeedbackWithUser);
    } catch (error) {
      throw AppError.database('Failed to submit feedback', error);
    }
  }

  /**
   * Gets a specific user's feedback for an app, or null if none exists.
   */
  async getUserFeedback(userId: string, appId: string): Promise<AppFeedbackItem | null> {
    try {
      const dbUser = await this.prisma.user.findFirst({
        where: {
          OR: [{ id: userId }, { supabaseAuthId: userId }],
        },
        select: { id: true },
      });
      if (!dbUser) return null;

      const record = await this.prisma.appFeedback.findUnique({
        where: { userId_appId: { userId: dbUser.id, appId } },
        include: this.feedbackInclude,
      });
      if (!record) return null;
      return mapToFeedbackItem(record as PrismaFeedbackWithUser);
    } catch (error) {
      throw AppError.database('Failed to fetch user feedback', error);
    }
  }

  /**
   * Lists approved feedback for an app with pagination, sorting, and user-like tracking.
   */
  async listByApp(
    appId: string,
    page: number = 1,
    limit: number = 10,
    sort: FeedbackSort = 'newest',
    clientIdentifier?: string
  ): Promise<{ items: AppFeedbackItem[]; totalCount: number }> {
    try {
      const skip = (page - 1) * limit;

      let orderBy: Prisma.AppFeedbackOrderByWithRelationInput;
      switch (sort) {
        case 'oldest':
          orderBy = { createdAt: 'asc' };
          break;
        case 'highest':
          orderBy = { rating: 'desc' };
          break;
        case 'lowest':
          orderBy = { rating: 'asc' };
          break;
        case 'newest':
        default:
          orderBy = { createdAt: 'desc' };
          break;
      }

      const where: Prisma.AppFeedbackWhereInput = {
        appId,
        status: 'approved',
      };

      const [records, totalCount] = await Promise.all([
        this.prisma.appFeedback.findMany({
          where,
          skip,
          take: limit,
          orderBy,
          include: this.feedbackInclude,
        }),
        this.prisma.appFeedback.count({ where }),
      ]);

      let likedIds = new Set<string>();
      if (clientIdentifier && records.length > 0) {
        const userLikes = await this.prisma.appFeedbackLike.findMany({
          where: {
            feedbackId: { in: records.map((r) => r.id) },
            identifier: clientIdentifier,
          },
          select: { feedbackId: true },
        });
        likedIds = new Set(userLikes.map((l) => l.feedbackId));
      }

      return {
        items: records.map((r) =>
          mapToFeedbackItem(r as PrismaFeedbackWithUser, likedIds.has(r.id))
        ),
        totalCount,
      };
    } catch (error) {
      throw AppError.database('Failed to list feedback', error);
    }
  }

  /**
   * Calculates the star distribution and summary for an app.
   */
  async getAppFeedbackSummary(appId: string): Promise<AppFeedbackSummary> {
    try {
      const where: Prisma.AppFeedbackWhereInput = { appId, status: 'approved' };

      const [aggregation, distribution] = await Promise.all([
        this.prisma.appFeedback.aggregate({
          where,
          _avg: { rating: true },
          _count: { rating: true },
        }),
        this.prisma.appFeedback.groupBy({
          by: ['rating'],
          where,
          _count: { rating: true },
        }),
      ]);

      const starCounts: Record<StarRating, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      for (const group of distribution) {
        const star = group.rating as StarRating;
        if (star >= 1 && star <= 5) {
          starCounts[star] = group._count.rating;
        }
      }

      return {
        averageRating: Math.round((aggregation._avg.rating ?? 0) * 10) / 10,
        totalCount: aggregation._count.rating,
        distribution: starCounts,
      };
    } catch (error) {
      throw AppError.database('Failed to calculate feedback summary', error);
    }
  }

  /**
   * Deletes a user's own feedback and recalculates stats.
   */
  async deleteFeedback(userId: string, appId: string): Promise<void> {
    try {
      const dbUser = await this.prisma.user.findFirst({
        where: {
          OR: [{ id: userId }, { supabaseAuthId: userId }],
        },
        select: { id: true },
      });
      if (!dbUser) {
        throw AppError.notFound('Feedback');
      }

      await this.prisma.$transaction(async (tx) => {
        // 1. Delete the feedback entry
        await tx.appFeedback.delete({
          where: { userId_appId: { userId: dbUser.id, appId } },
        });

        // 2. Recalculate aggregated stats
        const aggregation = await tx.appFeedback.aggregate({
          where: { appId, status: 'approved' },
          _avg: { rating: true },
          _count: { rating: true },
        });

        await tx.appStat.upsert({
          where: { appId },
          create: {
            appId,
            ratingAverage: aggregation._avg.rating ?? 0,
            ratingCount: aggregation._count.rating,
          },
          update: {
            ratingAverage: aggregation._avg.rating ?? 0,
            ratingCount: aggregation._count.rating,
          },
        });
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw AppError.notFound('Feedback');
      }
      if (error instanceof AppError) {
        throw error;
      }
      throw AppError.database('Failed to delete feedback', error);
    }
  }

  /**
   * Toggles a helpful vote for a feedback item.
   * If already voted by this user/identifier, removes the vote and decrements count.
   * If not yet voted, adds the vote and increments count.
   */
  async toggleHelpful(
    feedbackId: string,
    identifier: string,
    userId?: string
  ): Promise<{ helpfulCount: number; hasLiked: boolean }> {
    try {
      let dbUserId: string | null = null;
      if (userId) {
        try {
          const user = await this.prisma.user.findFirst({
            where: { OR: [{ id: userId }, { supabaseAuthId: userId }] },
            select: { id: true },
          });
          dbUserId = user?.id || null;
        } catch {
          // Continue with identifier
        }
      }

      // Check if this identifier already liked this feedback
      const existing = await this.prisma.appFeedbackLike.findUnique({
        where: {
          feedbackId_identifier: { feedbackId, identifier },
        },
      });

      if (existing) {
        // User already liked -> REMOVE LIKE (unlike)
        const result = await this.prisma.$transaction(async (tx) => {
          await tx.appFeedbackLike.delete({
            where: { id: existing.id },
          });

          const current = await tx.appFeedback.findUnique({
            where: { id: feedbackId },
            select: { helpfulCount: true },
          });

          const newCount = Math.max(0, (current?.helpfulCount ?? 1) - 1);
          const updated = await tx.appFeedback.update({
            where: { id: feedbackId },
            data: { helpfulCount: newCount },
            select: { helpfulCount: true },
          });

          return updated.helpfulCount;
        });

        return { helpfulCount: result, hasLiked: false };
      }

      // User has not yet liked -> ADD LIKE
      const result = await this.prisma.$transaction(async (tx) => {
        await tx.appFeedbackLike.create({
          data: {
            feedbackId,
            identifier,
            userId: dbUserId,
          },
        });

        const updated = await tx.appFeedback.update({
          where: { id: feedbackId },
          data: { helpfulCount: { increment: 1 } },
          select: { helpfulCount: true },
        });

        return updated.helpfulCount;
      });

      return { helpfulCount: result, hasLiked: true };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw AppError.notFound('Feedback');
        }
      }
      throw AppError.database('Failed to toggle helpful on feedback', error);
    }
  }

  /**
   * Backwards compatible likeFeedback method
   */
  async likeFeedback(
    feedbackId: string,
    identifier: string,
    userId?: string
  ): Promise<{ helpfulCount: number; alreadyLiked: boolean; hasLiked: boolean }> {
    const res = await this.toggleHelpful(feedbackId, identifier, userId);
    return {
      helpfulCount: res.helpfulCount,
      alreadyLiked: !res.hasLiked,
      hasLiked: res.hasLiked,
    };
  }

  /**
   * Backwards compatible incrementHelpful method
   */
  async incrementHelpful(feedbackId: string): Promise<number> {
    const res = await this.toggleHelpful(feedbackId, `anon:${Date.now()}`);
    return res.helpfulCount;
  }
}
