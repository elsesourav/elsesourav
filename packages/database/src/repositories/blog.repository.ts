import { PrismaClient, PublishStatus } from '@prisma/client';
import { prisma as defaultPrisma } from '../client';
import { mapPrismaBlogPostToDomain, PrismaBlogWithCategory } from '../mappers/blog.mapper';
import type { BlogPost as DomainBlogPost } from '@elsesourav/types';

export class BlogRepository {
  constructor(private readonly prisma: PrismaClient = defaultPrisma) {}

  async findPublished(): Promise<DomainBlogPost[]> {
    const records = await this.prisma.blogPost.findMany({
      where: { status: PublishStatus.PUBLISHED, deletedAt: null },
      orderBy: { publishedAt: 'desc' },
      include: { category: true },
    });
    return records.map((r) => mapPrismaBlogPostToDomain(r as PrismaBlogWithCategory));
  }

  async findBySlug(slug: string): Promise<DomainBlogPost | null> {
    const record = await this.prisma.blogPost.findUnique({
      where: { slug },
      include: { category: true },
    });
    if (!record) return null;
    return mapPrismaBlogPostToDomain(record as PrismaBlogWithCategory);
  }

  async incrementViews(id: string): Promise<void> {
    await this.prisma.blogPost.update({
      where: { id },
      data: { viewsCount: { increment: 1 } },
    });
  }
}
