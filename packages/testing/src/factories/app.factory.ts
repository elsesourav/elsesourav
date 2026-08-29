import type {
  App,
  AppListItem,
  PublicApp,
  AppLink,
  AppVersion,
  AppStatistics,
  Category,
  Tag,
  CategorySummary,
  TagSummary,
} from '@elsesourav/types';

let appCounter = 1;

export function resetAppFactoryCounter(): void {
  appCounter = 1;
}

export function createAppLink(overrides?: Partial<AppLink>): AppLink {
  const id = overrides?.id || `link-test-${appCounter}`;
  return {
    id,
    appId: overrides?.appId || `app-test-${appCounter}`,
    platform: overrides?.platform || 'web',
    label: overrides?.label || 'Launch Web App',
    url: overrides?.url || 'https://example.test/app',
    action: overrides?.action || 'open_app',
    isPrimary: overrides?.isPrimary ?? true,
    icon: overrides?.icon,
    displayOrder: overrides?.displayOrder ?? 0,
    isActive: overrides?.isActive ?? true,
  };
}

export function createAppVersion(overrides?: Partial<AppVersion>): AppVersion {
  const id = overrides?.id || `ver-test-${appCounter}`;
  return {
    id,
    appId: overrides?.appId || `app-test-${appCounter}`,
    version: overrides?.version || '1.0.0',
    releaseDate: overrides?.releaseDate ?? 1704067200000,
    changelog: overrides?.changelog || 'Initial production release.',
    downloadUrl: overrides?.downloadUrl,
  };
}

export function createAppStatistics(overrides?: Partial<AppStatistics>): AppStatistics {
  return {
    views: overrides?.views ?? 1200,
    launches: overrides?.launches ?? 450,
    libraryAdds: overrides?.libraryAdds ?? 120,
    ratingAverage: overrides?.ratingAverage ?? 4.8,
    ratingCount: overrides?.ratingCount ?? 32,
  };
}

export function createApp(overrides?: Partial<App>): App {
  const index = appCounter++;
  const id = overrides?.id || `app-test-${index}`;
  const slug = overrides?.slug || `test-app-${index}`;
  const name = overrides?.name || `Test Tool ${index}`;

  return {
    id,
    slug,
    name,
    shortDescription:
      overrides?.shortDescription ||
      `A versatile developer tool for engineering workflows (${name}).`,
    description:
      overrides?.description ||
      `Comprehensive documentation and runtime features for ${name}. Designed for high throughput and low-latency interaction.`,
    iconUrl:
      overrides?.iconUrl || 'https://res.cloudinary.com/elsesourav/image/upload/v2/icons/tool.png',
    featuredImageUrl: overrides?.featuredImageUrl,
    screenshots: overrides?.screenshots || [
      'https://res.cloudinary.com/elsesourav/image/upload/v2/screenshots/screenshot-1.png',
    ],
    demoUrl: overrides?.demoUrl,
    videoUrl: overrides?.videoUrl,
    primaryCategory: overrides?.primaryCategory || 'Developer Tools',
    categoryId: overrides?.categoryId || 'cat-dev-tools',
    tags: overrides?.tags || ['cli', 'productivity'],
    status: overrides?.status || 'published',
    platforms: overrides?.platforms || ['web', 'macos', 'linux'],
    links: overrides?.links || [
      createAppLink({
        appId: id,
        platform: 'web',
        label: `Launch ${name}`,
        url: `https://${slug}.test`,
      }),
    ],
    versions: overrides?.versions || [createAppVersion({ appId: id, version: '1.0.0' })],
    currentVersion: overrides?.currentVersion || '1.0.0',
    releaseDate: overrides?.releaseDate ?? 1704067200000,
    seoTitle: overrides?.seoTitle || `${name} — Developer Utility`,
    seoDescription: overrides?.seoDescription || `High-performance utility ${name}.`,
    socialImageUrl: overrides?.socialImageUrl,
    stats: overrides?.stats ? createAppStatistics(overrides.stats) : createAppStatistics(),
    isFeatured: overrides?.isFeatured ?? false,
    isPinned: overrides?.isPinned ?? false,
    sortOrder: overrides?.sortOrder ?? index,
    publishedAt: overrides?.publishedAt ?? 1704067200000,
    createdAt: overrides?.createdAt ?? 1704067200000,
    updatedAt: overrides?.updatedAt ?? 1704067200000,
    archivedAt: overrides?.archivedAt,
    deletedAt: overrides?.deletedAt,
  };
}

export function createAppListItem(app: App, categorySlug = 'developer-tools'): AppListItem {
  return {
    id: app.id,
    slug: app.slug,
    name: app.name,
    shortDescription: app.shortDescription,
    iconUrl: app.iconUrl,
    primaryCategory: app.primaryCategory,
    categorySlug,
    platforms: app.platforms,
    isFeatured: app.isFeatured,
    isPinned: app.isPinned,
    currentVersion: app.currentVersion,
    sortOrder: app.sortOrder,
    publishedAt: app.publishedAt,
  };
}

export function createPublicApp(app: App, categorySlug = 'developer-tools'): PublicApp {
  return {
    id: app.id,
    slug: app.slug,
    name: app.name,
    shortDescription: app.shortDescription,
    description: app.description,
    iconUrl: app.iconUrl,
    featuredImageUrl: app.featuredImageUrl,
    screenshots: app.screenshots,
    demoUrl: app.demoUrl,
    videoUrl: app.videoUrl,
    primaryCategory: app.primaryCategory,
    categorySlug,
    tags: app.tags,
    platforms: app.platforms,
    links: app.links,
    versions: app.versions || [],
    currentVersion: app.currentVersion,
    releaseDate: app.releaseDate,
    isFeatured: app.isFeatured,
    isPinned: app.isPinned,
    seoTitle: app.seoTitle,
    seoDescription: app.seoDescription,
    socialImageUrl: app.socialImageUrl,
    stats: app.stats,
    publishedAt: app.publishedAt,
    updatedAt: app.updatedAt,
  };
}

export function createCategory(overrides?: Partial<Category>): Category {
  const index = overrides?.orderIndex ?? 1;
  return {
    id: overrides?.id || `cat-${index}`,
    name: overrides?.name || 'Developer Tools',
    slug: overrides?.slug || 'developer-tools',
    description:
      overrides?.description || 'Utilities, command line tools, and web development software.',
    icon: overrides?.icon || 'terminal',
    orderIndex: index,
    isActive: overrides?.isActive ?? true,
  };
}

export function createCategorySummary(category: Category, appCount = 5): CategorySummary {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    orderIndex: category.orderIndex,
    appCount,
  };
}

export function createTag(overrides?: Partial<Tag>): Tag {
  return {
    id: overrides?.id || 'tag-1',
    name: overrides?.name || 'CLI',
    slug: overrides?.slug || 'cli',
  };
}

export function createTagSummary(tag: Tag, appCount = 3): TagSummary {
  return {
    id: tag.id,
    name: tag.name,
    slug: tag.slug,
    appCount,
  };
}
