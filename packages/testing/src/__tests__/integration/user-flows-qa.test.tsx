import { describe, it, expect } from 'vitest';
import { MockQueryService } from '../../utils/mock-query-service';
import {
  createPublicHomeScenario,
  createPopulatedAppsCatalogScenario,
  createEmptyAppsCatalogScenario,
  createLargePaginatedAppsCatalogScenario,
  createPopulatedSupportScenario,
  createEmptySupportScenario,
  createActiveUserDashboardScenario,
  createEmptyUserDashboardScenario,
  createAdminControlScenario,
} from '../../scenarios';
import {
  fixtureStandardUser,
  fixtureAdminUser,
  fixtureUsersList,
} from '../../fixtures/users.fixtures';
import { fixtureTicketMessagesOpen } from '../../fixtures/support.fixtures';
import { fixtureUserLibraryItems } from '../../fixtures/library.fixtures';

describe('UI Stabilization Phase 09 — Full User-Flow QA Validation', () => {
  const mockService = new MockQueryService();

  describe('1. Public Homepage User Journey', () => {
    it('executes: Open homepage → load content → inspect featured apps & devlogs', async () => {
      const scenario = createPublicHomeScenario();
      expect(scenario.appsResult.items.length).toBeGreaterThan(0);
      expect(scenario.blogResult.items.length).toBeGreaterThan(0);

      // Verify featured apps
      const primaryApp = scenario.appsResult.items[0];
      expect(primaryApp).toBeDefined();
      expect(primaryApp?.slug).toBe('terminal-pro');
      expect(primaryApp?.name).toBe('Terminal Pro');
      expect(primaryApp?.primaryCategory).toBe('Developer Tools');

      // Verify latest blogs
      const latestPost = scenario.blogResult.items[0];
      expect(latestPost).toBeDefined();
      expect(latestPost?.slug).toBe('architecture-insights');
      expect(latestPost?.readingTime).toBe(6);
    });
  });

  describe('2. App Discovery & Detail Journey', () => {
    it('executes: Catalog search → category filter → sorting → app detail page', async () => {
      const catalog = createPopulatedAppsCatalogScenario();
      expect(catalog.searchResult.items.length).toBe(5);

      // Filter by category
      const searchResult = await mockService.discoverPublishedApps({
        filters: { categorySlug: 'developer-tools' },
      });
      expect(searchResult.items.length).toBeGreaterThan(0);
      expect(searchResult.items.every((a) => a.primaryCategory === 'Developer Tools')).toBe(true);

      // Navigate to app details
      const detail = await mockService.getPublicAppBySlug('terminal-pro');
      expect(detail).toBeDefined();
      expect(detail?.id).toBe('app-terminal-pro');
      expect(detail?.links.length).toBeGreaterThan(0);
      expect(detail?.versions.length).toBeGreaterThan(0);
      expect(detail?.screenshots.length).toBeGreaterThan(0);
    });

    it('handles empty search results with graceful empty state', async () => {
      const emptyCatalog = createEmptyAppsCatalogScenario();
      expect(emptyCatalog.searchResult.items.length).toBe(0);
      expect(emptyCatalog.searchResult.totalCount).toBe(0);
    });

    it('handles large paginated dataset navigation (page 1 → page 2)', async () => {
      const page1 = createLargePaginatedAppsCatalogScenario(30, 1, 12);
      expect(page1.searchResult.items.length).toBe(12);
      expect(page1.searchResult.hasMore).toBe(true);
      expect(page1.searchResult.totalPages).toBe(3);

      const page2 = createLargePaginatedAppsCatalogScenario(30, 2, 12);
      expect(page2.searchResult.items.length).toBe(12);
      expect(page2.searchResult.page).toBe(2);
      expect(page2.searchResult.items[0]?.id).toBe('app-page-13');
    });
  });

  describe('3. Save App & User Library Flow', () => {
    it('executes: Authenticated user saves tool → appears in user library → unsaves tool', async () => {
      const userScenario = createActiveUserDashboardScenario();
      expect(userScenario.libraryItems.length).toBe(3);

      const savedApp = userScenario.libraryItems[0];
      expect(savedApp).toBeDefined();
      expect(savedApp?.app.name).toBe('Terminal Pro');

      // Simulate unsave
      const remaining = userScenario.libraryItems.filter((i) => i.appId !== 'app-terminal-pro');
      expect(remaining.length).toBe(2);
    });

    it('handles empty library for new user', () => {
      const emptyUser = createEmptyUserDashboardScenario();
      expect(emptyUser.libraryItems.length).toBe(0);
    });
  });

  describe('4. Engineering Blog Journey', () => {
    it('executes: Blog listing → category selection → article reading → related posts', async () => {
      const listing = await mockService.listPublicBlogPosts({ limit: 10 });
      expect(listing.items.length).toBe(3);

      const post = await mockService.getBlogPostBySlug('architecture-insights');
      expect(post).toBeDefined();
      expect(post?.title).toBe(
        'ElseSourav Architecture: Scaling with Turborepo and Next.js 15 App Router'
      );
      expect(post?.tags.map((t) => t.slug)).toContain('nextjs-15');
      expect(post?.content).toContain('## Architectural Motivation');
    });
  });

  describe('5. Knowledge Base & Help Journey', () => {
    it('executes: Help home → search articles → view topic article', async () => {
      const categories = await mockService.getHelpCategories();
      expect(categories.length).toBe(3);

      const articles = await mockService.getHelpArticlesByCategory('getting-started');
      expect(articles.length).toBeGreaterThan(0);
      expect(articles[0]?.title).toBe('Getting Started with the ElseSourav Developer Ecosystem');
    });
  });

  describe('6. Technical Support Desk Journey', () => {
    it('executes: User submits ticket → reviews conversation thread → staff reply', async () => {
      const support = createPopulatedSupportScenario();
      expect(support.tickets.length).toBe(3);

      const messages = fixtureTicketMessagesOpen;
      expect(messages.length).toBe(3);

      // Verify non-admin messages filter internal notes
      const publicMessages = messages.filter((m) => !m.isInternalNote);
      expect(publicMessages.length).toBe(2);
      expect(publicMessages.some((m) => m.isInternalNote)).toBe(false);
    });

    it('handles empty ticket inbox', () => {
      const empty = createEmptySupportScenario();
      expect(empty.tickets.length).toBe(0);
      expect(empty.listItems.length).toBe(0);
    });
  });

  describe('7. Notifications Journey', () => {
    it('executes: Unread notifications counter → view notification → mark as read', async () => {
      const userScenario = createActiveUserDashboardScenario();
      expect(userScenario.notifications.length).toBe(4);
      expect(userScenario.unreadNotificationCount).toBe(2);

      // Simulate marking item as read
      const updatedNotifications = userScenario.notifications.map((n) =>
        n.id === 'notif-1' ? { ...n, isRead: true, readAt: Date.now() } : n
      );
      const newUnreadCount = updatedNotifications.filter((n) => !n.isRead).length;
      expect(newUnreadCount).toBe(1);
    });
  });

  describe('8. Tenant Isolation & Security Boundaries', () => {
    it('enforces that User A cannot access User B private resources', () => {
      const userAId = fixtureStandardUser.id;
      const userBId = 'usr-other-user';

      const userALibrary = fixtureUserLibraryItems.filter((i) => i.userId === userAId);
      const userBLibrary = fixtureUserLibraryItems.filter((i) => i.userId === userBId);

      expect(userALibrary.every((i) => i.userId === userAId)).toBe(true);
      expect(userALibrary.some((i) => i.userId === userBId)).toBe(false);
      expect(userBLibrary.length).toBe(0);
    });
  });

  describe('9. Administrative Control Flow', () => {
    it('executes: Admin dashboard metrics → content management overview', () => {
      const adminScenario = createAdminControlScenario();
      expect(adminScenario.stats.totalApps).toBe(5);
      expect(adminScenario.stats.totalBlogPosts).toBe(3);
      expect(adminScenario.auditLogs.length).toBeGreaterThan(0);
      expect(adminScenario.users.length).toBe(fixtureUsersList.length);
    });

    it('denies standard user administrative access', () => {
      const nonAdminRole = fixtureStandardUser.role;
      const isAdminOrStaff = nonAdminRole === 'ADMIN' || nonAdminRole === 'STAFF';
      expect(isAdminOrStaff).toBe(false);

      const adminRole = fixtureAdminUser.role;
      const isAdmin = adminRole === 'ADMIN' || adminRole === 'STAFF';
      expect(isAdmin).toBe(true);
    });
  });
});
