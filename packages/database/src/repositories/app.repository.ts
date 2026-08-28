import { PrismaClient, PublishStatus } from '@prisma/client';
import { prisma as defaultPrisma } from '../client';
import { mapPrismaAppToDomain, PrismaAppWithRelations } from '../mappers/app.mapper';
import type { App as DomainApp } from '@elsesourav/types';

export class AppRepository {
  constructor(private readonly prisma: PrismaClient = defaultPrisma) {}

  private readonly appInclude = {
    category: true,
    tags: { include: { tag: true } },
    links: { orderBy: { displayOrder: 'asc' as const } },
    versions: { orderBy: { releaseDate: 'desc' as const } },
  };

  async findBySlug(slug: string): Promise<DomainApp | null> {
    const record = await this.prisma.app.findUnique({
      where: { slug },
      include: this.appInclude,
    });
    if (!record) return null;
    return mapPrismaAppToDomain(record as PrismaAppWithRelations);
  }

  async findPublished(): Promise<DomainApp[]> {
    const records = await this.prisma.app.findMany({
      where: { status: PublishStatus.PUBLISHED, deletedAt: null },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      include: this.appInclude,
    });
    return records.map((r) => mapPrismaAppToDomain(r as PrismaAppWithRelations));
  }

  async findFeatured(): Promise<DomainApp[]> {
    const records = await this.prisma.app.findMany({
      where: { status: PublishStatus.PUBLISHED, isFeatured: true, deletedAt: null },
      orderBy: { sortOrder: 'asc' },
      include: this.appInclude,
    });
    return records.map((r) => mapPrismaAppToDomain(r as PrismaAppWithRelations));
  }

  async findByCategory(categorySlug: string): Promise<DomainApp[]> {
    const records = await this.prisma.app.findMany({
      where: {
        status: PublishStatus.PUBLISHED,
        category: { slug: categorySlug },
        deletedAt: null,
      },
      orderBy: { sortOrder: 'asc' },
      include: this.appInclude,
    });
    return records.map((r) => mapPrismaAppToDomain(r as PrismaAppWithRelations));
  }

  async countPublished(): Promise<number> {
    return this.prisma.app.count({
      where: { status: PublishStatus.PUBLISHED, deletedAt: null },
    });
  }
}
