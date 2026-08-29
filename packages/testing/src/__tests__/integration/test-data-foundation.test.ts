import { describe, it, expect, beforeEach } from 'vitest';
import {
  createUser,
  createAdminUser,
  createStaffUser,
  createApp,
  createAppListItem,
  createPublicApp,
  createBlogPost,
  createHelpArticle,
  createSupportTicket,
  createTicketMessage,
  createUserLibraryItem,
  createNotificationItem,
  createMediaAsset,
  createAuditLogEntry,
  resetAllFactoryCounters,
} from '../../factories';
import {
  fixtureStandardUser,
  fixtureAdminUser,
  fixtureStaffUser,
  fixturePublishedApps,
  fixtureAppTerminalPro,
  fixtureBlogPosts,
  fixtureHelpArticles,
  fixtureSupportTicketsList,
  fixtureUserLibraryItems,
  fixtureNotificationsList,
  fixtureLongTextApp,
  fixtureZeroStatsApp,
  fixtureUnicodeUser,
  fixtureMultiTurnTicket,
} from '../../fixtures';
import {
  createPublicHomeScenario,
  createEmptyAppsCatalogScenario,
  createPopulatedAppsCatalogScenario,
  createLargePaginatedAppsCatalogScenario,
  createEmptyUserDashboardScenario,
  createActiveUserDashboardScenario,
  createAdminControlScenario,
} from '../../scenarios';
import { DeterministicSequence } from '../../utils/deterministic-seed';
import { MockQueryService } from '../../utils/mock-query-service';

describe('Test-Data Foundation Suite', () => {
  beforeEach(() => {
    resetAllFactoryCounters();
  });

  describe('1. User Factories & Fixtures', () => {
    it('creates standard user with incrementing ID and sensible defaults', () => {
      const user1 = createUser();
      const user2 = createUser({ displayName: 'Custom User' });

      expect(user1.id).toBe('usr-test-1');
      expect(user1.role).toBe('USER');
      expect(user1.status).toBe('active');
      expect(user2.id).toBe('usr-test-2');
      expect(user2.displayName).toBe('Custom User');
    });

    it('creates admin and staff users with proper role assignments', () => {
      const admin = createAdminUser();
      const staff = createStaffUser();

      expect(admin.role).toBe('ADMIN');
      expect(staff.role).toBe('STAFF');
    });

    it('validates predefined user fixtures conform to schema constraints', () => {
      expect(fixtureStandardUser.role).toBe('USER');
      expect(fixtureAdminUser.role).toBe('ADMIN');
      expect(fixtureStaffUser.role).toBe('STAFF');
      expect(fixtureUnicodeUser.displayName).toContain('René');
    });
  });

  describe('2. App Factories & Fixtures', () => {
    it('creates application entity and projections with accurate types', () => {
      const app = createApp({ name: 'Regex Analyzer', primaryCategory: 'Parsers & Regex' });
      const listItem = createAppListItem(app);
      const publicApp = createPublicApp(app);

      expect(app.name).toBe('Regex Analyzer');
      expect(listItem.name).toBe('Regex Analyzer');
      expect(publicApp.name).toBe('Regex Analyzer');
      expect(publicApp.stats.ratingAverage).toBeGreaterThan(0);
    });

    it('provides 5 published developer tools in predefined fixtures', () => {
      expect(fixturePublishedApps.length).toBe(5);
      expect(fixtureAppTerminalPro.slug).toBe('terminal-pro');
      expect(fixtureAppTerminalPro.platforms).toContain('web');
      expect(fixtureAppTerminalPro.links.length).toBeGreaterThan(0);
    });
  });

  describe('3. Blog & Help Documentation Fixtures', () => {
    it('creates blog posts with estimated reading time and author attribution', () => {
      const post = createBlogPost({ title: 'React 19 Server Actions in Depth' });
      expect(post.title).toBe('React 19 Server Actions in Depth');
      expect(post.author?.displayName).toBe('Sourav');
      expect(fixtureBlogPosts.length).toBe(3);
    });

    it('creates help articles with helpful vote counters and nested category links', () => {
      const article = createHelpArticle();
      expect(article.helpfulCount).toBeGreaterThan(0);
      expect(fixtureHelpArticles.length).toBe(3);
    });
  });

  describe('4. Support, Library & Notification Fixtures', () => {
    it('generates multi-turn support ticket threads', () => {
      const ticket = createSupportTicket({
        messages: [
          createTicketMessage({ senderRole: 'USER', message: 'Initial question' }),
          createTicketMessage({ senderRole: 'STAFF', message: 'Staff answer' }),
        ],
      });

      expect(ticket.messages?.length).toBe(2);
      expect(fixtureSupportTicketsList.length).toBe(3);
    });

    it('manages personal library bookmarks and notification states', () => {
      const lib = createUserLibraryItem({ isFavorite: true, isPinned: true });
      const notif = createNotificationItem({ isRead: false });

      expect(lib.isPinned).toBe(true);
      expect(notif.isRead).toBe(false);
      expect(fixtureUserLibraryItems.length).toBe(3);
      expect(fixtureNotificationsList.length).toBe(4);
    });
  });

  describe('5. Media & Audit Log Factories', () => {
    it('creates mock media assets and audit log entries without external side effects', () => {
      const media = createMediaAsset();
      const audit = createAuditLogEntry({ action: 'APP_DELETED' });

      expect(media.secureUrl).toContain('res.cloudinary.com');
      expect(audit.action).toBe('APP_DELETED');
    });
  });

  describe('6. Edge-Case Scenarios', () => {
    it('handles extremely long text strings without crashing layout projections', () => {
      expect(fixtureLongTextApp.name.length).toBeGreaterThan(100);
      expect(fixtureLongTextApp.shortDescription.length).toBeGreaterThan(200);
    });

    it('handles zero-state stats gracefully', () => {
      expect(fixtureZeroStatsApp.stats.views).toBe(0);
      expect(fixtureZeroStatsApp.stats.ratingAverage).toBe(0);
    });

    it('handles multi-turn conversation with 12 messages and internal notes', () => {
      expect(fixtureMultiTurnTicket.messages?.length).toBe(12);
      const internalNote = fixtureMultiTurnTicket.messages?.find((m) => m.isInternalNote);
      expect(internalNote).toBeDefined();
    });
  });

  describe('7. High-Level UI Scenarios', () => {
    it('builds public home scenario with 5 apps and 3 blogs', () => {
      const home = createPublicHomeScenario();
      expect(home.appsResult.items.length).toBe(5);
      expect(home.blogResult.items.length).toBe(3);
    });

    it('builds empty and populated apps catalog scenarios', () => {
      const empty = createEmptyAppsCatalogScenario();
      const populated = createPopulatedAppsCatalogScenario();

      expect(empty.searchResult.items.length).toBe(0);
      expect(populated.searchResult.items.length).toBe(5);
    });

    it('builds large paginated catalog scenario with 30 items across 3 pages', () => {
      const page1 = createLargePaginatedAppsCatalogScenario(30, 1, 12);
      const page2 = createLargePaginatedAppsCatalogScenario(30, 2, 12);

      expect(page1.searchResult.items.length).toBe(12);
      expect(page1.searchResult.totalPages).toBe(3);
      expect(page1.searchResult.hasMore).toBe(true);
      expect(page2.searchResult.items[0]?.id).toBe('app-page-13');
    });

    it('builds user dashboard and admin control plane scenarios', () => {
      const emptyDashboard = createEmptyUserDashboardScenario();
      const activeDashboard = createActiveUserDashboardScenario();
      const admin = createAdminControlScenario();

      expect(emptyDashboard.libraryItems.length).toBe(0);
      expect(activeDashboard.libraryItems.length).toBe(3);
      expect(activeDashboard.unreadNotificationCount).toBe(2);
      expect(admin.stats.totalApps).toBe(5);
    });
  });

  describe('8. Deterministic Seed & Mock Query Service', () => {
    it('produces identical sequence of pseudo-random numbers with same seed', () => {
      const seq1 = new DeterministicSequence(100);
      const seq2 = new DeterministicSequence(100);

      const r1 = [seq1.next(), seq1.next(), seq1.nextInt(1, 100)];
      const r2 = [seq2.next(), seq2.next(), seq2.nextInt(1, 100)];

      expect(r1).toEqual(r2);
    });

    it('MockQueryService executes filtered searches and returns paginated results', async () => {
      const service = new MockQueryService();
      const allApps = await service.discoverPublishedApps({ limit: 10 });
      const search = await service.discoverPublishedApps({ query: 'terminal' });
      const categories = await service.getCategories();

      expect(allApps.totalCount).toBe(5);
      expect(search.items.length).toBe(1);
      expect(search.items[0]?.slug).toBe('terminal-pro');
      expect(categories.length).toBe(5);
    });
  });
});
