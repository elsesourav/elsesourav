import type {
  App as PrismaApp,
  Category,
  Tag,
  AppLink as PrismaAppLink,
  AppVersion as PrismaAppVersion,
  AppStat as PrismaAppStat,
} from '@prisma/client';
import type {
  App as DomainApp,
  AppListItem,
  PublicApp,
  AppPlatform,
  AppActionType,
  AppStatus,
  AppOrientation,
} from '@elsesourav/types';

export type PrismaAppWithRelations = Omit<PrismaApp, 'requiresAuth'> & {
  requiresAuth?: boolean | null;
  category?: Category | null;
  tags?: { tag: Tag }[];
  links?: PrismaAppLink[];
  versions?: PrismaAppVersion[];
  stats?: PrismaAppStat | null;
  documentationMd?: string | null;
};

/**
 * Curated preview screenshots for flagship applications to enhance visual media showcase.
 */
const CURATED_APP_SCREENSHOTS: Record<string, string[]> = {
  'debayan-ganguly-portfolio': [
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=80',
    'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&q=80',
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80',
  ],
  'breakout-ball': [
    'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&q=80',
    'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1200&q=80',
  ],
  spectralens: [
    'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1200&q=80',
    'https://images.unsplash.com/photo-1542744094-3a31f272c490?w=1200&q=80',
  ],
};

export function mapPrismaAppToDomain(prismaApp: PrismaAppWithRelations): DomainApp {
  const screenshots =
    prismaApp.screenshots && prismaApp.screenshots.length > 0
      ? prismaApp.screenshots
      : CURATED_APP_SCREENSHOTS[prismaApp.slug] ?? [];

  return {
    id: prismaApp.id,
    slug: prismaApp.slug,
    name: prismaApp.name,
    shortDescription: prismaApp.shortDescription,
    description: prismaApp.description,
    iconUrl: prismaApp.iconUrl,
    featuredImageUrl: prismaApp.featuredImageUrl ?? undefined,
    featuredImageMobileUrl: prismaApp.featuredImageMobileUrl ?? undefined,
    screenshots,
    demoUrl: prismaApp.demoUrl ?? undefined,
    videoUrl: prismaApp.videoUrl ?? undefined,
    primaryCategory: prismaApp.category?.name || 'General',
    categoryId: prismaApp.categoryId,
    tags: prismaApp.tags?.map((t) => t.tag.slug) || [],
    platforms: (prismaApp.links?.map((l) => l.platform as AppPlatform) || [
      'web',
    ]) as readonly AppPlatform[],
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
    documentationMd: prismaApp.documentationMd ?? undefined,
    status: prismaApp.status.toLowerCase() as AppStatus,
    isFeatured: prismaApp.isFeatured,
    isPinned: prismaApp.isPinned,
    requiresAuth: (prismaApp as unknown as { requiresAuth?: boolean }).requiresAuth ?? false,
    orientation:
      ((prismaApp as unknown as { orientation?: string }).orientation as AppOrientation) ||
      'landscape',
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
    bundleSize: (prismaApp as unknown as { bundleSize?: string }).bundleSize ?? undefined,
    primaryLanguage:
      (prismaApp as unknown as { primaryLanguage?: string }).primaryLanguage ?? undefined,
    authorName: prismaApp.authorName ?? undefined,
    authorImageUrl: prismaApp.authorImageUrl ?? undefined,
    authorUrl: prismaApp.authorUrl ?? undefined,
    authorRole: prismaApp.authorRole ?? undefined,
    languages: (prismaApp as unknown as { languages?: string[] }).languages ?? undefined,
    publishedAt: prismaApp.publishedAt ? prismaApp.publishedAt.getTime() : undefined,
    createdAt: prismaApp.createdAt.getTime(),
    updatedAt: prismaApp.updatedAt.getTime(),
    deletedAt: prismaApp.deletedAt ? prismaApp.deletedAt.getTime() : undefined,
  };
}

export function mapPrismaAppToListItem(prismaApp: PrismaAppWithRelations): AppListItem {
  return {
    id: prismaApp.id,
    slug: prismaApp.slug,
    name: prismaApp.name,
    shortDescription: prismaApp.shortDescription,
    iconUrl: prismaApp.iconUrl,
    featuredImageUrl: prismaApp.featuredImageUrl ?? undefined,
    featuredImageMobileUrl: prismaApp.featuredImageMobileUrl ?? undefined,
    primaryCategory: prismaApp.category?.name || 'General',
    categorySlug: prismaApp.category?.slug || 'general',
    platforms: (prismaApp.links?.map((l) => l.platform as AppPlatform) || [
      'web',
    ]) as readonly AppPlatform[],
    isFeatured: prismaApp.isFeatured,
    isPinned: prismaApp.isPinned,
    requiresAuth: (prismaApp as unknown as { requiresAuth?: boolean }).requiresAuth ?? false,
    orientation:
      ((prismaApp as unknown as { orientation?: string }).orientation as AppOrientation) ||
      undefined,
    authorName: prismaApp.authorName ?? undefined,
    authorImageUrl: prismaApp.authorImageUrl ?? undefined,
    authorUrl: prismaApp.authorUrl ?? undefined,
    authorRole: prismaApp.authorRole ?? undefined,
    currentVersion: prismaApp.currentVersion ?? undefined,
    sortOrder: prismaApp.sortOrder,
    publishedAt: prismaApp.publishedAt ? prismaApp.publishedAt.getTime() : undefined,
    ratingAverage: prismaApp.stats?.ratingAverage ?? undefined,
    ratingCount: prismaApp.stats?.ratingCount ?? undefined,
  };
}

export function mapPrismaAppToPublicDetail(prismaApp: PrismaAppWithRelations): PublicApp {
  const domain = mapPrismaAppToDomain(prismaApp);
  return {
    id: domain.id,
    slug: domain.slug,
    name: domain.name,
    shortDescription: domain.shortDescription,
    description: domain.description,
    iconUrl: domain.iconUrl,
    featuredImageUrl: domain.featuredImageUrl,
    featuredImageMobileUrl: domain.featuredImageMobileUrl,
    screenshots: domain.screenshots,
    demoUrl: domain.demoUrl,
    videoUrl: domain.videoUrl,
    primaryCategory: prismaApp.category?.name || 'General',
    categorySlug: prismaApp.category?.slug || 'general',
    tags: domain.tags,
    platforms: domain.platforms,
    links: domain.links,
    versions: domain.versions || [],
    currentVersion: domain.currentVersion,
    releaseDate: domain.releaseDate,
    documentationMd: domain.documentationMd,
    isFeatured: domain.isFeatured,
    isPinned: domain.isPinned,
    requiresAuth: domain.requiresAuth,
    orientation: domain.orientation,
    authorName: domain.authorName,
    authorImageUrl: domain.authorImageUrl,
    authorUrl: domain.authorUrl,
    authorRole: domain.authorRole,
    seoTitle: domain.seoTitle,
    seoDescription: domain.seoDescription,
    socialImageUrl: domain.socialImageUrl,
    stats: domain.stats,
    bundleSize: domain.bundleSize,
    primaryLanguage: domain.primaryLanguage,
    languages: domain.languages,
    publishedAt: domain.publishedAt,
    createdAt: domain.createdAt,
    updatedAt: domain.updatedAt,
  };
}
