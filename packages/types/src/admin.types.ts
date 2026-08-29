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
