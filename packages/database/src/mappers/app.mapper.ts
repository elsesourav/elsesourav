import type {
  App as PrismaApp,
  Category,
  Tag,
  AppLink as PrismaAppLink,
  AppVersion as PrismaAppVersion,
  AppStat as PrismaAppStat,
} from '@prisma/client';
import type { App as DomainApp, AppPlatform, AppActionType, AppStatus } from '@elsesourav/types';

export type PrismaAppWithRelations = PrismaApp & {
  category?: Category | null;
  tags?: { tag: Tag }[];
  links?: PrismaAppLink[];
  versions?: PrismaAppVersion[];
  stats?: PrismaAppStat | null;
};

export function mapPrismaAppToDomain(prismaApp: PrismaAppWithRelations): DomainApp {
  return {
    id: prismaApp.id,
    slug: prismaApp.slug,
    name: prismaApp.name,
    shortDescription: prismaApp.shortDescription,
    description: prismaApp.description,
    iconUrl: prismaApp.iconUrl,
    featuredImageUrl: prismaApp.featuredImageUrl ?? undefined,
    screenshots: [],
    demoUrl: prismaApp.demoUrl ?? undefined,
    videoUrl: prismaApp.videoUrl ?? undefined,
    primaryCategory: prismaApp.category?.slug || 'other',
    tags: prismaApp.tags?.map((t) => t.tag.slug) || [],
    platforms: (prismaApp.links?.map((l) => l.platform as AppPlatform) || ['web']) as readonly AppPlatform[],
    links:
      prismaApp.links?.map((l) => ({
        id: l.id,
        appId: l.appId,
        platform: l.platform as AppPlatform,
        label: l.label,
        url: l.url,
        action: l.action as AppActionType | undefined,
        isPrimary: l.isPrimary,
        displayOrder: l.displayOrder,
        isActive: l.isActive,
      })) || [],
    versions:
      prismaApp.versions?.map((v) => ({
        id: v.id,
        appId: v.appId,
        version: v.version,
        releaseDate: v.releaseDate.getTime(),
        changelog: v.changelog,
        downloadUrl: v.downloadUrl ?? undefined,
      })) || [],
    status: prismaApp.status.toLowerCase() as AppStatus,
    isFeatured: prismaApp.isFeatured,
    isPinned: prismaApp.isPinned,
    sortOrder: prismaApp.sortOrder,
    currentVersion: prismaApp.currentVersion ?? '1.0.0',
    seoTitle: prismaApp.seoTitle ?? undefined,
    seoDescription: prismaApp.seoDescription ?? undefined,
    stats: {
      views: prismaApp.stats?.views ?? 0,
      launches: prismaApp.stats?.launches ?? 0,
      libraryAdds: prismaApp.stats?.libraryAdds ?? 0,
      ratingAverage: prismaApp.stats?.ratingAverage,
      ratingCount: prismaApp.stats?.ratingCount,
    },
    publishedAt: prismaApp.publishedAt ? prismaApp.publishedAt.getTime() : undefined,
    createdAt: prismaApp.createdAt.getTime(),
    updatedAt: prismaApp.updatedAt.getTime(),
    deletedAt: prismaApp.deletedAt ? prismaApp.deletedAt.getTime() : undefined,
  };
}
