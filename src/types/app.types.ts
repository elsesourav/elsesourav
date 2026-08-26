import type { ID, Timestamp } from './common.types';

/**
 * App Publication Status
 */
export type AppStatus = 'published' | 'draft' | 'archived' | 'beta' | 'unlisted';

/**
 * App Categories
 */
export type AppCategory =
  | 'web-apps'
  | 'games'
  | 'extensions'
  | 'mobile'
  | 'developer-tools'
  | 'desktop'
  | 'ai-tools'
  | 'utilities';

/**
 * App Tag Entity
 */
export interface AppTag {
  readonly id: ID;
  readonly name: string;
  readonly slug: string;
  readonly color?: string;
}

/**
 * Supported Target Platforms
 */
export type AppPlatform =
  'web' | 'chrome' | 'android' | 'github' | 'windows' | 'macos' | 'linux' | 'pwa' | 'external';

/**
 * Context-Aware Action Types
 */
export type AppActionType =
  | 'open_app'
  | 'add_to_chrome'
  | 'get_on_play_store'
  | 'view_on_github'
  | 'download'
  | 'visit_website';

/**
 * App Link Model (Multi-destination, platform-agnostic)
 */
export interface AppLink {
  readonly id: ID;
  readonly platform: AppPlatform;
  readonly action: AppActionType;
  readonly url: string;
  readonly label: string;
  readonly isPrimary: boolean;
  readonly version?: string;
  readonly fileSize?: string;
  readonly target?: '_blank' | '_self';
}

/**
 * App Media Assets
 */
export type AppMediaKind = 'icon' | 'screenshot' | 'banner' | 'video_preview' | 'thumbnail';

export interface AppMedia {
  readonly id: ID;
  readonly kind: AppMediaKind;
  readonly url: string;
  readonly alt: string;
  readonly width?: number;
  readonly height?: number;
  readonly isPrimary?: boolean;
}

/**
 * App Changelog Details
 */
export interface AppChangelog {
  readonly version: string;
  readonly releaseDate: Timestamp;
  readonly title: string;
  readonly highlights: readonly string[];
  readonly description?: string;
}

/**
 * App Version History
 */
export interface AppVersion {
  readonly version: string;
  readonly releaseDate: Timestamp;
  readonly changelog?: AppChangelog;
  readonly isCurrent: boolean;
  readonly minOsVersion?: string;
}

/**
 * App Analytics & Engagement Statistics
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
  readonly tagline: string;
  readonly description: string;
  readonly category: AppCategory;
  readonly tags: readonly string[];
  readonly status: AppStatus;
  readonly platforms: readonly AppPlatform[];
  readonly links: readonly AppLink[];
  readonly media: readonly AppMedia[];
  readonly currentVersion: string;
  readonly versions: readonly AppVersion[];
  readonly stats: AppStatistics;
  readonly isFeatured: boolean;
  readonly isPinned: boolean;
  readonly sortOrder: number;
  readonly createdAt: Timestamp;
  readonly updatedAt: Timestamp;
  readonly publishedAt?: Timestamp;
}
