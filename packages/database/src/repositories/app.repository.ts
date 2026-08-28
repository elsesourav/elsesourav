import { PrismaClient, PublishStatus, Prisma } from '@prisma/client';
import { prisma as defaultPrisma } from '../client';
import {
  mapPrismaAppToDomain,
  mapPrismaAppToListItem,
  mapPrismaAppToPublicDetail,
  PrismaAppWithRelations,
} from '../mappers/app.mapper';
import { AppError } from '@elsesourav/types';
import type {
  App as DomainApp,
  AppListItem,
  PublicApp,
  AppQueryOptions,
  CreateAppInput,
  UpdateAppInput,
  AppSearchInput,
  AppSearchResult,
} from '@elsesourav/types';

export class AppRepository {
  constructor(private readonly prisma: PrismaClient = defaultPrisma) {}

  private readonly appInclude = {
    category: true,
    tags: { include: { tag: true } },
    links: { orderBy: { displayOrder: 'asc' as const } },
    versions: { orderBy: { releaseDate: 'desc' as const } },
    stats: true,
  };

  async findById(id: string): Promise<DomainApp | null> {
    try {
      const record = await this.prisma.app.findUnique({
        where: { id },
        include: this.appInclude,
      });
      if (!record) return null;
      return mapPrismaAppToDomain(record as PrismaAppWithRelations);
    } catch (error) {
      throw AppError.database(`Failed to find application by id: ${id}`, error);
    }
  }

  async findBySlug(slug: string): Promise<DomainApp | null> {
    try {
      const record = await this.prisma.app.findUnique({
        where: { slug: slug.trim().toLowerCase() },
        include: this.appInclude,
      });
      if (!record) return null;
      return mapPrismaAppToDomain(record as PrismaAppWithRelations);
    } catch (error) {
      throw AppError.database(`Failed to find application by slug: ${slug}`, error);
    }
  }

  async getPublicDetailBySlug(slug: string): Promise<PublicApp | null> {
    try {
      const record = await this.prisma.app.findFirst({
        where: {
          slug: slug.trim().toLowerCase(),
          status: PublishStatus.PUBLISHED,
          deletedAt: null,
        },
        include: this.appInclude,
      });
      if (!record) return null;
      return mapPrismaAppToPublicDetail(record as PrismaAppWithRelations);
    } catch (error) {
      throw AppError.database(`Failed to fetch public application detail: ${slug}`, error);
    }
  }

  async listPublic(options: AppQueryOptions = {}): Promise<AppListItem[]> {
    try {
      const limit = Math.min(Math.max(options.limit ?? 20, 1), 50);

      const where: Prisma.AppWhereInput = {
        status: PublishStatus.PUBLISHED,
        deletedAt: null,
      };

      if (options.categoryId) {
        where.categoryId = options.categoryId;
      }

      if (options.categorySlug) {
        where.category = {
          slug: options.categorySlug.trim().toLowerCase(),
        };
      }

      if (options.tagSlug) {
        where.tags = {
          some: {
            tag: { slug: options.tagSlug.trim().toLowerCase() },
          },
        };
      }

      if (options.isFeatured !== undefined) {
        where.isFeatured = options.isFeatured;
      }

      if (options.search) {
        const sanitizedQuery = options.search.trim().slice(0, 50);
        if (sanitizedQuery.length > 0) {
          where.OR = [
            { name: { contains: sanitizedQuery, mode: 'insensitive' } },
            { shortDescription: { contains: sanitizedQuery, mode: 'insensitive' } },
          ];
        }
      }

      const allowedSortFields = ['createdAt', 'sortOrder', 'name', 'publishedAt'] as const;
      const sortField = allowedSortFields.includes(options.sortField as (typeof allowedSortFields)[number])
        ? options.sortField!
        : 'sortOrder';
      const sortDirection = options.sortDirection === 'desc' ? 'desc' : 'asc';

      const records = await this.prisma.app.findMany({
        where,
        take: limit,
        orderBy: { [sortField]: sortDirection },
        include: {
          category: true,
          links: true,
        },
      });

      return records.map((r) => mapPrismaAppToListItem(r as PrismaAppWithRelations));
    } catch (error) {
      throw AppError.database('Failed to query public applications list', error);
    }
  }

  async searchPublic(input: AppSearchInput = {}): Promise<AppSearchResult> {
    try {
      const limit = Math.min(Math.max(input.limit ?? 20, 1), 50);
      const where: Prisma.AppWhereInput = {
        status: PublishStatus.PUBLISHED,
        deletedAt: null,
      };

      if (input.query) {
        const sanitized = input.query.trim().slice(0, 50);
        if (sanitized.length > 0) {
          where.OR = [
            { name: { contains: sanitized, mode: 'insensitive' } },
            { shortDescription: { contains: sanitized, mode: 'insensitive' } },
            { description: { contains: sanitized, mode: 'insensitive' } },
          ];
        }
      }

      if (input.filters?.categorySlug) {
        where.category = {
          slug: input.filters.categorySlug.trim().toLowerCase(),
        };
      }

      if (input.filters?.tagSlug) {
        where.tags = {
          some: {
            tag: { slug: input.filters.tagSlug.trim().toLowerCase() },
          },
        };
      }

      if (input.filters?.isFeatured !== undefined) {
        where.isFeatured = input.filters.isFeatured;
      }

      const totalCount = await this.prisma.app.count({ where });

      const records = await this.prisma.app.findMany({
        where,
        take: limit,
        orderBy:
          input.sort === 'newest'
            ? { publishedAt: 'desc' }
            : input.sort === 'name'
              ? { name: 'asc' }
              : { sortOrder: 'asc' },
        include: {
          category: true,
          links: true,
        },
      });

      return {
        items: records.map((r) => mapPrismaAppToListItem(r as PrismaAppWithRelations)),
        totalCount,
      };
    } catch (error) {
      throw AppError.database('Failed to execute public application search', error);
    }
  }

  async list(options: AppQueryOptions = {}): Promise<DomainApp[]> {
    try {
      const limit = Math.min(Math.max(options.limit ?? 20, 1), 50);

      const where: Prisma.AppWhereInput = {
        deletedAt: null,
      };

      if (options.status) {
        where.status = options.status.toUpperCase() as PublishStatus;
      } else {
        where.status = PublishStatus.PUBLISHED;
      }

      if (options.categoryId) {
        where.categoryId = options.categoryId;
      }

      if (options.isFeatured !== undefined) {
        where.isFeatured = options.isFeatured;
      }

      if (options.tagSlug) {
        where.tags = {
          some: {
            tag: { slug: options.tagSlug.trim().toLowerCase() },
          },
        };
      }

      if (options.search) {
        const sanitizedQuery = options.search.trim().slice(0, 50);
        if (sanitizedQuery.length > 0) {
          where.OR = [
            { name: { contains: sanitizedQuery, mode: 'insensitive' } },
            { shortDescription: { contains: sanitizedQuery, mode: 'insensitive' } },
          ];
        }
      }

      const allowedSortFields = ['createdAt', 'sortOrder', 'name', 'publishedAt'] as const;
      const sortField = allowedSortFields.includes(options.sortField as (typeof allowedSortFields)[number])
        ? options.sortField!
        : 'sortOrder';
      const sortDirection = options.sortDirection === 'desc' ? 'desc' : 'asc';

      const records = await this.prisma.app.findMany({
        where,
        take: limit,
        orderBy: { [sortField]: sortDirection },
        include: this.appInclude,
      });

      return records.map((r) => mapPrismaAppToDomain(r as PrismaAppWithRelations));
    } catch (error) {
      throw AppError.database('Failed to query applications list', error);
    }
  }

  async create(data: CreateAppInput): Promise<DomainApp> {
    try {
      const record = await this.prisma.app.create({
        data: {
          name: data.name.trim(),
          slug: data.slug.trim().toLowerCase(),
          shortDescription: data.shortDescription.trim(),
          description: data.description.trim(),
          iconUrl: data.iconUrl.trim(),
          featuredImageUrl: data.featuredImageUrl,
          demoUrl: data.demoUrl,
          videoUrl: data.videoUrl,
          categoryId: data.categoryId,
          isFeatured: data.isFeatured ?? false,
          isPinned: data.isPinned ?? false,
          sortOrder: data.sortOrder ?? 0,
          seoTitle: data.seoTitle,
          seoDescription: data.seoDescription,
          stats: {
            create: {
              views: 0,
              launches: 0,
              libraryAdds: 0,
            },
          },
        },
        include: this.appInclude,
      });

      return mapPrismaAppToDomain(record as PrismaAppWithRelations);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw AppError.validation(`An application with slug '${data.slug}' already exists`);
      }
      throw AppError.database('Failed to create application record', error);
    }
  }

  async update(id: string, data: UpdateAppInput): Promise<DomainApp> {
    try {
      const record = await this.prisma.app.update({
        where: { id },
        data: {
          name: data.name?.trim(),
          slug: data.slug ? data.slug.trim().toLowerCase() : undefined,
          shortDescription: data.shortDescription?.trim(),
          description: data.description?.trim(),
          iconUrl: data.iconUrl?.trim(),
          featuredImageUrl: data.featuredImageUrl,
          demoUrl: data.demoUrl,
          videoUrl: data.videoUrl,
          categoryId: data.categoryId,
          isFeatured: data.isFeatured,
          isPinned: data.isPinned,
          sortOrder: data.sortOrder,
          seoTitle: data.seoTitle,
          seoDescription: data.seoDescription,
        },
        include: this.appInclude,
      });

      return mapPrismaAppToDomain(record as PrismaAppWithRelations);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw AppError.notFound('Application');
      }
      throw AppError.database(`Failed to update application: ${id}`, error);
    }
  }

  async publishWithVersionTransaction(
    appId: string,
    versionData: { version: string; changelog: string; downloadUrl?: string }
  ): Promise<DomainApp> {
    try {
      return await this.prisma.$transaction(async (tx) => {
        await tx.appVersion.create({
          data: {
            appId,
            version: versionData.version.trim(),
            changelog: versionData.changelog.trim(),
            downloadUrl: versionData.downloadUrl,
          },
        });

        const updatedApp = await tx.app.update({
          where: { id: appId },
          data: {
            status: PublishStatus.PUBLISHED,
            currentVersion: versionData.version.trim(),
            publishedAt: new Date(),
          },
          include: this.appInclude,
        });

        return mapPrismaAppToDomain(updatedApp as PrismaAppWithRelations);
      });
    } catch (error) {
      throw AppError.database(`Failed to execute atomic publish transaction for app: ${appId}`, error);
    }
  }

  async countPublished(): Promise<number> {
    try {
      return await this.prisma.app.count({
        where: { status: PublishStatus.PUBLISHED, deletedAt: null },
      });
    } catch (error) {
      throw AppError.database('Failed to count published applications', error);
    }
  }
}
