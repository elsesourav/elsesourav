import type { ID, Timestamp } from './common.types';
import type { UserRole } from './user.types';

export interface AdminContext {
  readonly id: ID;
  readonly email: string;
  readonly role: UserRole;
  readonly displayName: string;
}

export interface AdminDashboardStats {
  readonly totalApps: number;
  readonly publishedApps: number;
  readonly draftApps: number;
  readonly totalBlogPosts: number;
  readonly publishedBlogPosts: number;
  readonly totalHelpArticles: number;
  readonly totalTickets: number;
  readonly openTickets: number;
  readonly totalUsers: number;
}

export type AdminActivityType = 'app' | 'blog' | 'help' | 'support' | 'user';

export interface AdminActivityItem {
  readonly id: string;
  readonly type: AdminActivityType;
  readonly title: string;
  readonly subtitle: string;
  readonly timestamp: Timestamp;
  readonly link: string;
  readonly status: string;
  readonly badgeVariant?: 'default' | 'info' | 'outline' | 'success' | 'warning';
}

export interface AdminNavigationItem {
  readonly title: string;
  readonly href: string;
  readonly icon: string;
  readonly badge?: string | number;
  readonly isExact?: boolean;
}

export type SiteLinkPlatform =
  | 'github'
  | 'twitter'
  | 'linkedin'
  | 'youtube'
  | 'discord'
  | 'telegram'
  | 'bluesky'
  | 'email'
  | 'website'
  | 'other';

export interface SiteLinkItem {
  readonly id: string;
  readonly label: string;
  readonly url: string;
  readonly platform: SiteLinkPlatform;
  readonly priority: number;
  readonly isActive: boolean;
}

export type SiteContactMethodType =
  'email' | 'support_desk' | 'telegram' | 'discord' | 'calendar' | 'phone' | 'matrix' | 'other';

export interface SiteContactItem {
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly type: SiteContactMethodType;
  readonly description?: string;
  readonly priority: number;
  readonly isActive: boolean;
}

export interface SiteFooterLink {
  readonly id: string;
  readonly label: string;
  readonly url: string;
  readonly isExternal?: boolean;
  readonly priority: number;
  readonly isActive: boolean;
}

export interface SiteSetting {
  readonly key: string;
  readonly value: string;
  readonly description?: string | null;
  readonly updatedAt: Timestamp;
  readonly updatedBy?: string | null;
}

export interface SiteAndCreatorIdentity {
  readonly site: {
    readonly name: string;
    readonly tagline: string;
    readonly description: string;
    readonly url: string;
    readonly logoUrl?: string;
    readonly ogImageUrl?: string;
    readonly keywords?: string;
    readonly statusBadge?: string;
  };
  readonly footer: {
    readonly copyright: string;
    readonly text: string;
    readonly statusText?: string;
    readonly showSocials: boolean;
    readonly showBackToTop: boolean;
    readonly links: readonly SiteFooterLink[];
  };
  readonly homepage: {
    readonly heroBadge: string;
    readonly heroHeadline: string;
    readonly heroSubtitle: string;
    readonly primaryCtaLabel: string;
    readonly secondaryCtaLabel: string;
    readonly announcementBanner?: string;
    readonly appsTitle: string;
    readonly appsSubtitle: string;
    readonly blogTitle: string;
    readonly blogSubtitle: string;
  };
  readonly creator: {
    readonly name: string;
    readonly handle: string;
    readonly title: string;
    readonly role: string;
    readonly location: string;
    readonly avatarUrl?: string;
    readonly shortBio: string;
    readonly longBio: string;
    readonly positioning: string;
    readonly principles: readonly string[];
    readonly focus: readonly string[];
    readonly technologies: readonly string[];
    readonly links: readonly SiteLinkItem[];
    readonly contacts: readonly SiteContactItem[];
  };
}
