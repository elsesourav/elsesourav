import type { ID, Timestamp } from './common.types';

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
