import type { ID, Timestamp } from './common.types';

/**
 * App Publication Status
 * Normal public users can only see 'published'
 */
export type AppStatus = 'draft' | 'published' | 'archived';

/**
 * Supported Target Platforms
 */
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

/**
 * Platform Action Types
 */
export type AppActionType =
  | 'open_app'
  | 'add_to_chrome'
  | 'get_on_play_store'
  | 'view_on_github'
  | 'download'
  | 'visit_website';

/**
 * Platform Link Model (Multi-destination, platform-agnostic)
 */
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

import type { AppMedia, AppMediaType } from './media.types';
export type { AppMedia, AppMediaType };

/**
 * Bounded App Statistics Summary
 */
export interface AppStatistics {
  readonly views: number;
  readonly launches: number;
  readonly libraryAdds: number;
  readonly ratingAverage?: number;
  readonly ratingCount?: number;
}

/**
 * App Domain Entity
 */
export interface App {
  readonly id: ID;
  readonly slug: string;
  readonly name: string;
  readonly shortDescription: string;
  readonly description: string;
  readonly iconUrl: string;
  readonly featuredImageUrl?: string;
  readonly screenshots: readonly string[];
  readonly demoUrl?: string;
  readonly videoUrl?: string;
  readonly primaryCategory: string;
  readonly tags: readonly string[];
  readonly status: AppStatus;
  readonly platforms: readonly AppPlatform[];
  readonly links: readonly AppLink[];
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
