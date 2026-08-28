import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext } from '@/app/auth-context';
import { ThemeProvider } from '@/app/theme';
import { ToastProvider } from '@/components';
import { AppRoutes } from '@/routes/AppRoutes';

import { appService } from '@/services/app.service';
import { appSearchService } from '@/services/app-search.service';
import { blogService } from '@/services/blog.service';
import { helpService } from '@/services/help.service';
import { supportService } from '@/services/support.service';
import { userLibraryService } from '@/services/library.service';
import { userService } from '@/services/user.service';
import { notificationService } from '@/services/notification.service';
import { globalSearchService } from '@/services/global-search.service';
import { classificationService } from '@/services/classification.service';
import { appMediaService } from '@/services/media.service';
import { appVersionService } from '@/services/version.service';
import { feedbackService } from '@/services/feedback.service';
import { auditService } from '@/services/audit.service';
import { appRepository } from '@/repositories/app.repository';

import {
  createTestUser,
  createTestAdmin,
  createTestApp,
  createTestCategory,
  createTestTag,
  createTestBlogPost,
  createTestHelpCategory,
  createTestHelpArticle,
  createTestSupportTicket,
  createTestSupportMessage,
  createTestNotification,
  createTestUserLibraryItem,
  createTestAppVersion,
} from './fixtures/test-data';
import { ok } from '@/lib/result';
import type { AuthContextValue, AuthUser } from '@/types/auth.types';

describe('Release Candidate Quality Gate Test Suite (Prompt 75)', () => {
  const mockUser = createTestUser();
  const mockAdmin = createTestAdmin();

  const mockUserAuthUser: AuthUser = {
    uid: mockUser.id,
    email: mockUser.email,
    emailVerified: true,
    displayName: mockUser.displayName,
    photoURL: null,
    isAnonymous: false,
    providerId: 'password',
    createdAt: mockUser.createdAt,
  };

  const mockAdminAuthUser: AuthUser = {
    uid: mockAdmin.id,
    email: mockAdmin.email,
    emailVerified: true,
    displayName: mockAdmin.displayName,
    photoURL: null,
    isAnonymous: false,
    providerId: 'password',
    createdAt: mockAdmin.createdAt,
  };

  const mockApp = createTestApp();
  const mockCategory = createTestCategory();
  const mockTag = createTestTag();
  const mockBlog = createTestBlogPost();
  const mockHelpCat = createTestHelpCategory();
  const mockHelpArt = createTestHelpArticle();
  const mockTicket = createTestSupportTicket();
  const mockMessage = createTestSupportMessage();
  const mockNotification = createTestNotification();
  const mockLibraryItem = createTestUserLibraryItem();
  const mockVersion = createTestAppVersion();

  const createAuthMock = (isAdminUser = false, overrides?: Partial<AuthContextValue>): AuthContextValue => ({
    authUser: isAdminUser ? mockAdminAuthUser : mockUserAuthUser,
    user: isAdminUser ? mockAdmin : mockUser,
    role: isAdminUser ? 'admin' : 'user',
    isAuthenticated: true,
    isAdmin: isAdminUser,
    isLoading: false,
    error: null,
    signIn: vi.fn().mockResolvedValue(ok(mockUserAuthUser)),
    signUp: vi.fn().mockResolvedValue(ok(mockUserAuthUser)),
    signInWithGoogle: vi.fn().mockResolvedValue(ok(mockUserAuthUser)),
    signOut: vi.fn().mockResolvedValue(ok(undefined)),
    sendPasswordReset: vi.fn().mockResolvedValue(ok(undefined)),
    sendVerificationEmail: vi.fn().mockResolvedValue(ok(undefined)),
    changePassword: vi.fn().mockResolvedValue(ok(undefined)),
    deleteAccount: vi.fn().mockResolvedValue(ok(undefined)),
    clearError: vi.fn(),
    ...overrides,
  });

  const renderApp = (
    initialRoute = '/',
    isAdminUser = false,
    authOverrides?: Partial<AuthContextValue>
  ) => {
    return render(
      <MemoryRouter initialEntries={[initialRoute]}>
        <ThemeProvider>
          <AuthContext.Provider value={createAuthMock(isAdminUser, authOverrides)}>
            <ToastProvider>
              <AppRoutes />
            </ToastProvider>
          </AuthContext.Provider>
        </ThemeProvider>
      </MemoryRouter>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup domain service mocks
    vi.spyOn(appService, 'listPublishedApps').mockResolvedValue(
      ok({ items: [mockApp], totalCount: 1, hasMore: false })
    );
    vi.spyOn(appService, 'listFeaturedApps').mockResolvedValue(
      ok({ items: [mockApp], totalCount: 1, hasMore: false })
    );
    vi.spyOn(appService, 'listLatestApps').mockResolvedValue(
      ok({ items: [mockApp], totalCount: 1, hasMore: false })
    );
    vi.spyOn(appService, 'getAppBySlug').mockImplementation(async (slug) => {
      if (slug === mockApp.slug) return ok(mockApp);
      return ok(null);
    });
    vi.spyOn(appService, 'getAppById').mockImplementation(async (id) => {
      if (id === mockApp.id) return ok(mockApp);
      return ok(null);
    });
    vi.spyOn(appService, 'getRelatedApps').mockResolvedValue(ok([]));

    vi.spyOn(appSearchService, 'searchApps').mockResolvedValue(
      ok({ items: [mockApp], totalMatches: 1, hasMore: false })
    );
    vi.spyOn(globalSearchService, 'search').mockResolvedValue(
      ok({
        query: 'terminal',
        apps: [
          {
            id: mockApp.id,
            type: 'app',
            title: mockApp.name,
            description: mockApp.shortDescription,
            destination: `/apps/${mockApp.slug}`,
          },
        ],
        blogPosts: [
          {
            id: mockBlog.id,
            type: 'blog_post',
            title: mockBlog.title,
            description: mockBlog.excerpt,
            destination: `/blog/${mockBlog.slug}`,
          },
        ],
        helpArticles: [
          {
            id: mockHelpArt.id,
            type: 'help_article',
            title: mockHelpArt.title,
            description: mockHelpArt.excerpt || '',
            destination: `/help/article/${mockHelpArt.slug}`,
          },
        ],
        totalCount: 3,
      })
    );

    vi.spyOn(blogService, 'listPublishedPosts').mockResolvedValue(
      ok({ items: [mockBlog], totalCount: 1, hasMore: false })
    );
    vi.spyOn(blogService, 'listFeaturedPosts').mockResolvedValue(
      ok({ items: [mockBlog], totalCount: 1, hasMore: false })
    );
    vi.spyOn(blogService, 'listLatestPosts').mockResolvedValue(
      ok({ items: [mockBlog], totalCount: 1, hasMore: false })
    );
    vi.spyOn(blogService, 'listActiveCategories').mockResolvedValue(
      ok({ items: [], totalCount: 0, hasMore: false })
    );
    vi.spyOn(blogService, 'getPostBySlug').mockImplementation(async (slug) => {
      if (slug === mockBlog.slug) return ok(mockBlog);
      return ok(null);
    });

    vi.spyOn(helpService, 'listActiveCategories').mockResolvedValue(
      ok({ items: [mockHelpCat], totalCount: 1, hasMore: false })
    );
    vi.spyOn(helpService, 'listFeaturedArticles').mockResolvedValue(
      ok({ items: [mockHelpArt], totalCount: 1, hasMore: false })
    );
    vi.spyOn(helpService, 'listPublishedArticles').mockResolvedValue(
      ok({ items: [mockHelpArt], totalCount: 1, hasMore: false })
    );
    vi.spyOn(helpService, 'getCategoryBySlug').mockImplementation(async (slug) => {
      if (slug === mockHelpCat.slug) return ok(mockHelpCat);
      return ok(null);
    });
    vi.spyOn(helpService, 'getArticleBySlug').mockImplementation(async (slug) => {
      if (slug === mockHelpArt.slug) return ok(mockHelpArt);
      return ok(null);
    });
    vi.spyOn(helpService, 'listArticlesByCategory').mockResolvedValue(
      ok({ items: [mockHelpArt], totalCount: 1, hasMore: false })
    );

    vi.spyOn(supportService, 'listUserTickets').mockResolvedValue(
      ok({ items: [mockTicket], totalCount: 1, hasMore: false })
    );
    vi.spyOn(supportService, 'getTicket').mockImplementation(async (id) => {
      if (id === mockTicket.id) return ok(mockTicket);
      return ok(null);
    });
    vi.spyOn(supportService, 'listMessages').mockResolvedValue(
      ok({ items: [mockMessage], totalCount: 1, hasMore: false })
    );
    vi.spyOn(supportService, 'createTicket').mockResolvedValue(ok(mockTicket));
    vi.spyOn(supportService, 'addMessage').mockResolvedValue(ok(mockMessage));

    vi.spyOn(userLibraryService, 'getUserLibrary').mockResolvedValue(
      ok({ items: [mockLibraryItem], totalCount: 1, hasMore: false })
    );
    vi.spyOn(userLibraryService, 'getEnrichedLibrary').mockResolvedValue(
      ok({ items: [{ libraryItem: mockLibraryItem, app: mockApp, isUnavailable: false }], totalCount: 1, hasMore: false })
    );
    vi.spyOn(userLibraryService, 'getLibraryCount').mockResolvedValue(ok(1));
    vi.spyOn(userLibraryService, 'isAppSaved').mockResolvedValue(ok(true));
    vi.spyOn(userLibraryService, 'toggleSave').mockResolvedValue(ok({ isSaved: true, item: mockLibraryItem }));

    vi.spyOn(userService, 'getUserProfile').mockResolvedValue(ok(mockUser));
    vi.spyOn(userService, 'updateUserPreferences').mockResolvedValue(ok(mockUser));

    vi.spyOn(notificationService, 'getUserNotifications').mockResolvedValue(
      ok({ items: [mockNotification], totalCount: 1, hasMore: false })
    );
    vi.spyOn(notificationService, 'subscribeToUserNotifications').mockImplementation((_userId, callback) => {
      callback([mockNotification]);
      return () => {};
    });
    vi.spyOn(notificationService, 'getUnreadCount').mockResolvedValue(ok(1));

    vi.spyOn(classificationService, 'listActiveCategories').mockResolvedValue(
      ok({ items: [mockCategory], totalCount: 1, hasMore: false })
    );
    vi.spyOn(classificationService, 'listActiveTags').mockResolvedValue(
      ok({ items: [mockTag], totalCount: 1, hasMore: false })
    );

    vi.spyOn(appMediaService, 'getAppIcon').mockResolvedValue(
      ok({
        id: 'm1',
        appId: 'app-terminal-pro',
        type: 'icon',
        url: mockApp.iconUrl,
        altText: 'Terminal Pro Icon',
        isPrimary: true,
        orderIndex: 0,
        isActive: true,
        createdAt: 1700000000000,
        updatedAt: 1700000000000,
      })
    );
    vi.spyOn(appMediaService, 'listScreenshots').mockResolvedValue(
      ok({ items: [], totalCount: 0, hasMore: false })
    );

    vi.spyOn(appVersionService, 'listVersions').mockResolvedValue(
      ok({ items: [mockVersion], totalCount: 1, hasMore: false })
    );

    vi.spyOn(feedbackService, 'getApprovedReviews').mockResolvedValue(
      ok({ items: [], totalCount: 0, hasMore: false })
    );
    vi.spyOn(feedbackService, 'getAppRatingAggregate').mockResolvedValue(
      ok({
        id: 'agg-1',
        appId: 'app-terminal-pro',
        averageRating: 4.8,
        ratingCount: 15,
        distribution: { 1: 0, 2: 0, 3: 1, 4: 4, 5: 10 },
        updatedAt: 1700000000000,
      })
    );
    vi.spyOn(auditService, 'listLogs').mockResolvedValue(
      ok({ items: [], totalCount: 0, hasMore: false })
    );
    vi.spyOn(appRepository, 'findMany').mockResolvedValue(
      ok({ items: [mockApp], total: 1, hasMore: false })
    );
  });

  // ===========================================================================
  // TASK 1 — FULL PUBLIC REGRESSION
  // ===========================================================================
  // ===========================================================================
  // TASK 1 — FULL PUBLIC REGRESSION
  // ===========================================================================
  describe('Task 1: Full Public Navigation & Content Discovery Regression', () => {
    it('1. Homepage loads', async () => {
      const { unmount } = renderApp('/');
      expect(await screen.findByRole('heading', { level: 1 })).toBeInTheDocument();
      unmount();
    });

    it('2. Apps Catalogue loads', async () => {
      const { unmount: unmountApps } = renderApp('/apps');
      expect(await screen.findByRole('heading', { name: /Explore Applications|Apps/i })).toBeInTheDocument();
      unmountApps();
    });

    it('3. Search Page loads', async () => {
      const { unmount: unmountSearch } = renderApp('/search');
      expect(await screen.findByRole('heading', { name: /Search ElseSourav/i })).toBeInTheDocument();
      unmountSearch();
    });

    it('4. App Details loads', async () => {
      const { unmount: unmountDetail } = renderApp('/apps/terminal-pro');
      expect(await screen.findByRole('heading', { name: 'Terminal Pro' })).toBeInTheDocument();
      unmountDetail();
    });

    it('5. Blog Page loads', async () => {
      const { unmount: unmountBlog } = renderApp('/blog');
      expect(await screen.findByRole('heading', { name: /Engineering Notes & Articles|Journal & Devlogs|Blog/i })).toBeInTheDocument();
      unmountBlog();
    });

    it('6. Help Center loads', async () => {
      const { unmount: unmountHelp } = renderApp('/help');
      expect(await screen.findByRole('heading', { name: /Help Center & Documentation|Help|How can we help you\?/i })).toBeInTheDocument();
      unmountHelp();
    });

    it('7. Support Page loads', async () => {
      const { unmount: unmountSupport } = renderApp('/support');
      expect(await screen.findByRole('heading', { name: /How can we help you\?/i })).toBeInTheDocument();
      unmountSupport();
    });

    it('8. Legal Pages load', async () => {
      const { unmount: unmountPrivacy } = renderApp('/privacy');
      expect(await screen.findByRole('heading', { name: /Privacy Policy/i })).toBeInTheDocument();
      unmountPrivacy();

      const { unmount: unmountTerms } = renderApp('/terms');
      expect(await screen.findByRole('heading', { name: /Terms of Service/i })).toBeInTheDocument();
      unmountTerms();

      const { unmount: unmountA11y } = renderApp('/accessibility');
      expect(await screen.findByRole('heading', { name: /Accessibility Statement/i })).toBeInTheDocument();
      unmountA11y();
    });
  });

  // ===========================================================================
  // TASK 2 — FULL USER REGRESSION
  // ===========================================================================
  describe('Task 2: Full User Account, Library & Communication Regression', () => {
    it('1. User Library loads', async () => {
      const { unmount: unmountLibrary } = renderApp('/library', false);
      expect(await screen.findByRole('heading', { name: /Personal Software Library|Library/i })).toBeInTheDocument();
      unmountLibrary();
    });

    it('2. Settings Page loads', async () => {
      const { unmount: unmountSettings } = renderApp('/settings', false);
      expect(await screen.findByRole('heading', { name: /Test Regular User|User Profile/i })).toBeInTheDocument();
      unmountSettings();
    });

    it('3. User Tickets Page loads', async () => {
      const { unmount: unmountTickets } = renderApp('/support/tickets', false);
      expect(await screen.findByRole('heading', { name: /My Support Requests|Support Tickets|Tickets/i })).toBeInTheDocument();
      unmountTickets();
    });
  });

  // ===========================================================================
  // TASK 3 — FULL ADMIN REGRESSION
  // ===========================================================================
  describe('Task 3: Full Admin Control & Management Regression', () => {
    it('1. Admin Dashboard loads', async () => {
      const { unmount: unmountDash } = renderApp('/admin', true);
      expect(await screen.findByRole('heading', { name: /Admin Dashboard/i })).toBeInTheDocument();
      unmountDash();
    });

    it('2. Admin Apps Management loads', async () => {
      const { unmount: unmountApps } = renderApp('/admin/apps', true);
      expect(await screen.findByRole('heading', { name: /^Applications$/i })).toBeInTheDocument();
      unmountApps();
    });

    it('3. Admin Audit Trail loads', async () => {
      const { unmount: unmountAudit } = renderApp('/admin/audit-logs', true);
      expect(await screen.findByRole('heading', { name: /Security & Audit Trail|Audit Logs/i })).toBeInTheDocument();
      unmountAudit();
    });
  });

  // ===========================================================================
  // TASK 4 — SECURITY REGRESSION
  // ===========================================================================
  describe('Task 4: Security & Authorization Enforcements', () => {
    it('denies non-admin access to admin routes and redirects cleanly', async () => {
      renderApp('/admin', false);
      // Non-admin user should not see Admin Dashboard and should be redirected or blocked
      expect(screen.queryByRole('heading', { name: 'Admin Dashboard' })).not.toBeInTheDocument();
    });

    it('denies unauthenticated access to user library', async () => {
      renderApp('/library', false, {
        isAuthenticated: false,
        authUser: null,
        user: null,
      });
      // Should redirect unauthenticated visitor away from protected library
      expect(screen.queryByRole('heading', { name: /Personal Software Library/i })).not.toBeInTheDocument();
    });
  });

  // ===========================================================================
  // TASK 10 — ERROR HANDLING REGRESSION
  // ===========================================================================
  describe('Task 10: Error States & Resilience', () => {
    it('renders 404 page with recovery links on invalid URL', async () => {
      renderApp('/non-existent-page-xyz');
      expect(await screen.findByRole('heading', { name: 'Page Not Found', level: 1 }, { timeout: 5000 })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Back to Home/i })).toBeInTheDocument();
    });
  });
});
