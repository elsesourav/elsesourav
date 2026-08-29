import type {
  AdminDashboardStats,
  AdminUserListItem,
  SupportTicketListItem,
  AuditLog,
  App,
  BlogPost,
  MediaAsset,
} from '@elsesourav/types';
import { fixturePublishedApps } from '../fixtures/apps.fixtures';
import { fixtureBlogPosts } from '../fixtures/blog.fixtures';
import { fixtureUsersList } from '../fixtures/users.fixtures';
import { fixtureSupportTicketsList, fixtureSupportTicketListItems } from '../fixtures/support.fixtures';
import { fixtureAuditLogs } from '../fixtures/audit.fixtures';
import { fixtureMediaAssets } from '../fixtures/media.fixtures';
import { createAdminUserListItem } from '../factories/user.factory';

export interface AdminControlScenarioData {
  readonly stats: AdminDashboardStats;
  readonly users: readonly AdminUserListItem[];
  readonly tickets: readonly SupportTicketListItem[];
  readonly apps: readonly App[];
  readonly posts: readonly BlogPost[];
  readonly media: readonly MediaAsset[];
  readonly auditLogs: readonly AuditLog[];
}

export function createAdminControlScenario(): AdminControlScenarioData {
  return {
    stats: {
      totalApps: fixturePublishedApps.length,
      publishedApps: fixturePublishedApps.filter((a) => a.status === 'published').length,
      draftApps: 0,
      totalBlogPosts: fixtureBlogPosts.length,
      publishedBlogPosts: fixtureBlogPosts.filter((p) => p.status === 'published').length,
      totalHelpArticles: 3,
      totalTickets: fixtureSupportTicketsList.length,
      openTickets: fixtureSupportTicketsList.filter((t) => t.status === 'open' || t.status === 'in_progress').length,
      totalUsers: fixtureUsersList.length,
    },
    users: fixtureUsersList.map((u) => createAdminUserListItem(u)),
    tickets: fixtureSupportTicketListItems,
    apps: fixturePublishedApps,
    posts: fixtureBlogPosts,
    media: fixtureMediaAssets,
    auditLogs: fixtureAuditLogs,
  };
}
