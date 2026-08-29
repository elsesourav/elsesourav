import type { ID, SortDirection, Timestamp } from './common.types';

export type AppStatus = 'draft' | 'published' | 'archived';

export type AppPlatform =
  | 'web'
  | 'chrome'
  | 'android'
  | 'ios'
  | 'windows'
  | 'macos'
  | 'linux'
  | 'github'
  | 'download'
  | 'other';

export type AppActionType =
  | 'open_app'
  | 'add_to_chrome'
  | 'get_on_play_store'
  | 'view_on_github'
  | 'download'
  | 'visit_website';

export interface AppLink {
  readonly id: ID;
  readonly appId: ID;
  readonly platform: AppPlatform;
  readonly label: string;
  readonly url: string;
  readonly action?: AppActionType;
  readonly isPrimary?: boolean;
  readonly icon?: string;
  readonly displayOrder: number;
  readonly isActive: boolean;
}

export interface AppVersion {
  readonly id: ID;
  readonly appId: ID;
  readonly version: string;
  readonly releaseDate: Timestamp;
  readonly changelog: string;
  readonly downloadUrl?: string;
}

export interface AppStatistics {
  readonly views: number;
  readonly launches: number;
  readonly libraryAdds: number;
  readonly ratingAverage?: number;
  readonly ratingCount?: number;
}

export interface App {
  readonly id: ID;
  readonly slug: string;
  readonly name: string;
  readonly shortDescription: string;
  readonly description: string;
  readonly documentationMd?: string;
  readonly iconUrl: string;
  readonly featuredImageUrl?: string;
  readonly screenshots: readonly string[];
  readonly demoUrl?: string;
  readonly videoUrl?: string;
  readonly primaryCategory: string;
  readonly categoryId?: string;
  readonly tags: readonly string[];
  readonly status: AppStatus;
  readonly platforms: readonly AppPlatform[];
  readonly links: readonly AppLink[];
  readonly versions?: readonly AppVersion[];
  readonly currentVersion?: string;
  readonly releaseDate?: Timestamp;
  readonly seoTitle?: string;
  readonly seoDescription?: string;
  readonly socialImageUrl?: string;
  readonly stats: AppStatistics;
  readonly isFeatured: boolean;
  readonly isPinned: boolean;
  readonly sortOrder: number;
  readonly publishedAt?: Timestamp;
  readonly createdAt: Timestamp;
  readonly updatedAt: Timestamp;
  readonly archivedAt?: Timestamp;
  readonly deletedAt?: Timestamp;
}

/**
 * Lightweight public representation for catalog listings and cards
 */
export interface AppListItem {
  readonly id: ID;
  readonly slug: string;
  readonly name: string;
  readonly shortDescription: string;
  readonly iconUrl: string;
  readonly primaryCategory: string;
  readonly categorySlug: string;
  readonly platforms: readonly AppPlatform[];
  readonly isFeatured: boolean;
  readonly isPinned: boolean;
  readonly currentVersion?: string;
  readonly sortOrder: number;
  readonly publishedAt?: Timestamp;
}

/**
 * Detailed public projection for individual application presentation pages
 */
export interface PublicApp {
  readonly id: ID;
  readonly slug: string;
  readonly name: string;
  readonly shortDescription: string;
  readonly description: string;
  readonly documentationMd?: string;
  readonly iconUrl: string;
  readonly featuredImageUrl?: string;
  readonly screenshots: readonly string[];
  readonly demoUrl?: string;
  readonly videoUrl?: string;
  readonly primaryCategory: string;
  readonly categorySlug: string;
  readonly tags: readonly string[];
  readonly platforms: readonly AppPlatform[];
  readonly links: readonly AppLink[];
  readonly versions: readonly AppVersion[];
  readonly currentVersion?: string;
  readonly releaseDate?: Timestamp;
  readonly isFeatured: boolean;
  readonly isPinned: boolean;
  readonly seoTitle?: string;
  readonly seoDescription?: string;
  readonly socialImageUrl?: string;
  readonly stats: AppStatistics;
  readonly publishedAt?: Timestamp;
  readonly updatedAt: Timestamp;
}

export interface Category {
  readonly id: ID;
  readonly name: string;
  readonly slug: string;
  readonly description?: string;
  readonly icon?: string;
  readonly orderIndex: number;
  readonly isActive: boolean;
}

export interface Tag {
  readonly id: ID;
  readonly name: string;
  readonly slug: string;
}

export interface CreateAppInput {
  readonly name: string;
  readonly slug: string;
  readonly shortDescription: string;
  readonly description: string;
  readonly documentationMd?: string;
  readonly iconUrl: string;
  readonly featuredImageUrl?: string;
  readonly categoryId: string;
  readonly tagIds?: readonly string[];
  readonly demoUrl?: string;
  readonly videoUrl?: string;
  readonly isFeatured?: boolean;
  readonly isPinned?: boolean;
  readonly sortOrder?: number;
  readonly seoTitle?: string;
  readonly seoDescription?: string;
}

export interface UpdateAppInput {
  readonly name?: string;
  readonly slug?: string;
  readonly shortDescription?: string;
  readonly description?: string;
  readonly documentationMd?: string;
  readonly iconUrl?: string;
  readonly featuredImageUrl?: string;
  readonly categoryId?: string;
  readonly tagIds?: readonly string[];
  readonly demoUrl?: string;
  readonly videoUrl?: string;
  readonly isFeatured?: boolean;
  readonly isPinned?: boolean;
  readonly sortOrder?: number;
  readonly seoTitle?: string;
  readonly seoDescription?: string;
}

export interface PublishAppInput {
  readonly appId: string;
  readonly version: string;
  readonly changelog: string;
}

export interface AppQueryOptions {
  readonly status?: AppStatus;
  readonly categoryId?: string;
  readonly categorySlug?: string;
  readonly tagSlug?: string;
  readonly search?: string;
  readonly isFeatured?: boolean;
  readonly limit?: number;
  readonly cursor?: string;
  readonly sortField?: 'createdAt' | 'sortOrder' | 'name' | 'publishedAt';
  readonly sortDirection?: SortDirection;
}
