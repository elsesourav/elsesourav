import { PrismaClient, Prisma, PublishStatus } from '@prisma/client';
import { prisma as defaultPrisma } from '../client';
import { mapPrismaLibraryItemToDomain, PrismaLibraryItemWithApp } from '../mappers/library.mapper';
import { AppError } from '@elsesourav/types';
import type { LibraryItem, SaveAppInput, UserLibraryResult } from '@elsesourav/types';

export class LibraryRepository {
  constructor(private readonly prisma: PrismaClient = defaultPrisma) {}

  private readonly libraryItemInclude = {
    app: {
      include: {
        category: true,
        links: true,
      },
    },
  };

  async isAppSaved(userId: string, appId: string): Promise<boolean> {
    try {
      const count = await this.prisma.userLibraryItem.count({
        where: { userId, appId },
      });
      return count > 0;
    } catch (error) {
      throw AppError.database('Failed to check library status', error);
    }
  }

  async getUserSavedAppIds(userId: string): Promise<string[]> {
    try {
      const items = await this.prisma.userLibraryItem.findMany({
        where: { userId },
        select: { appId: true },
      });
      return items.map((i) => i.appId);
    } catch (error) {
      throw AppError.database('Failed to fetch user saved app IDs', error);
    }
  }

  async saveApp(userId: string, data: SaveAppInput): Promise<LibraryItem> {
    try {
      return await this.prisma.$transaction(async (tx) => {
        // 1. Verify app exists and is published
        const app = await tx.app.findUnique({
          where: { id: data.appId },
          include: { category: true, links: true },
        });

        if (!app || app.deletedAt || app.status !== PublishStatus.PUBLISHED) {
          throw AppError.notFound('Published application');
        }

        // 2. Upsert user library item
        const item = await tx.userLibraryItem.upsert({
          where: {
            userId_appId: {
              userId,
              appId: data.appId,
            },
          },
          create: {
            userId,
            appId: data.appId,
            isFavorite: data.isFavorite ?? false,
            isPinned: data.isPinned ?? false,
            customNotes: data.customNotes,
          },
          update: {
            isFavorite: data.isFavorite,
            isPinned: data.isPinned,
            customNotes: data.customNotes,
          },
          include: {
            app: {
              include: {
                category: true,
                links: true,
              },
            },
          },
        });

        // 3. Atomically increment library adds statistic
        await tx.appStat.upsert({
          where: { appId: data.appId },
          create: {
            appId: data.appId,
            libraryAdds: 1,
          },
          update: {
            libraryAdds: { increment: 1 },
          },
        });

        return mapPrismaLibraryItemToDomain(item as unknown as PrismaLibraryItemWithApp);
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw AppError.database(`Failed to save application to library: ${data.appId}`, error);
    }
  }

  async unsaveApp(userId: string, appId: string): Promise<boolean> {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const deleted = await tx.userLibraryItem.deleteMany({
          where: {
            userId,
            appId,
          },
        });

        if (deleted.count > 0) {
          // Decrement library adds statistic
          await tx.appStat.updateMany({
            where: { appId, libraryAdds: { gt: 0 } },
            data: {
              libraryAdds: { decrement: 1 },
            },
          });
          return true;
        }

        return false;
      });
    } catch (error) {
      throw AppError.database(`Failed to remove application from library: ${appId}`, error);
    }
  }

  async getUserLibrary(
    userId: string,
    options: { page?: number; limit?: number; isFavorite?: boolean } = {}
  ): Promise<UserLibraryResult> {
    try {
      const page = Math.max(options.page ?? 1, 1);
      const limit = Math.min(Math.max(options.limit ?? 20, 1), 50);
      const skip = (page - 1) * limit;

      const where: Prisma.UserLibraryItemWhereInput = {
        userId,
        app: {
          status: PublishStatus.PUBLISHED,
          deletedAt: null,
        },
      };

      if (options.isFavorite !== undefined) {
        where.isFavorite = options.isFavorite;
      }

      const totalCount = await this.prisma.userLibraryItem.count({ where });

      const records = await this.prisma.userLibraryItem.findMany({
        where,
        take: limit,
        skip,
        orderBy: [{ isPinned: 'desc' }, { addedAt: 'desc' }],
        include: this.libraryItemInclude,
      });

      return {
        items: records.map((r) =>
          mapPrismaLibraryItemToDomain(r as unknown as PrismaLibraryItemWithApp)
        ),
        totalCount,
      };
    } catch (error) {
      throw AppError.database('Failed to fetch user library', error);
    }
  }
}
