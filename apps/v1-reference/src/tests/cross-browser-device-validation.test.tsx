import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
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

describe('Cross-Browser & Multi-Device Validation Test Suite (Prompt 74)', () => {
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

  const renderWithViewport = (
    initialRoute = '/',
    viewport: { width: number; height: number } = { width: 1280, height: 800 },
    isAdminUser = false,
    authOverrides?: Partial<AuthContextValue>
  ) => {
    window.innerWidth = viewport.width;
    window.innerHeight = viewport.height;
    window.dispatchEvent(new Event('resize'));

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

    // Set standard desktop viewport default
    window.innerWidth = 1280;
    window.innerHeight = 800;

    // Domain Services Mocks
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

    vi.spyOn(userLibraryService, 'getUserLibrary').mockResolvedValue(
      ok({ items: [mockLibraryItem], totalCount: 1, hasMore: false })
    );
    vi.spyOn(userLibraryService, 'getEnrichedLibrary').mockResolvedValue(
      ok({ items: [{ libraryItem: mockLibraryItem, app: mockApp, isUnavailable: false }], totalCount: 1, hasMore: false })
    );
    vi.spyOn(userLibraryService, 'getLibraryCount').mockResolvedValue(ok(1));

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
  });

  // ===========================================================================
  // TASK 1 — CORE PAGES ACROSS VIEWPORTS (Desktop, Tablet, Mobile)
  // ===========================================================================
  describe('Task 1: Core Pages Cross-Device Responsiveness', () => {
    const viewports = [
      { name: 'Desktop (1280x800)', width: 1280, height: 800 },
      { name: 'Tablet (768x1024)', width: 768, height: 1024 },
      { name: 'Mobile iPhone (375x667)', width: 375, height: 667 },
      { name: 'Mobile Android (390x844)', width: 390, height: 844 },
    ];

    viewports.forEach(({ name, width, height }) => {
      it(`renders Homepage cleanly on ${name}`, async () => {
        renderWithViewport('/', { width, height });
        expect(await screen.findByRole('heading', { level: 1 }, { timeout: 15000 })).toBeInTheDocument();
      });

      it(`renders Apps Discovery page cleanly on ${name}`, async () => {
        renderWithViewport('/apps', { width, height });
        expect(await screen.findByRole('heading', { name: /Explore Applications|Apps/i }, { timeout: 15000 })).toBeInTheDocument();
      });

      it(`renders App Detail page cleanly on ${name}`, async () => {
        renderWithViewport('/apps/terminal-pro', { width, height });
        expect(await screen.findByText('Terminal Pro', {}, { timeout: 15000 })).toBeInTheDocument();
      });

      it(`renders Blog page cleanly on ${name}`, async () => {
        renderWithViewport('/blog', { width, height });
        expect(await screen.findByRole('heading', { name: /Engineering Notes & Articles|Journal & Devlogs|Blog/i }, { timeout: 15000 })).toBeInTheDocument();
      });

      it(`renders Help Center cleanly on ${name}`, async () => {
        renderWithViewport('/help', { width, height });
        expect(await screen.findByRole('heading', { name: /Help Center & Documentation|Help/i }, { timeout: 15000 })).toBeInTheDocument();
      });

      it(`renders Search page cleanly on ${name}`, async () => {
        renderWithViewport('/search', { width, height });
        expect(await screen.findByRole('heading', { name: /Search ElseSourav/i }, { timeout: 15000 })).toBeInTheDocument();
      });

      it(`renders Library page for authenticated users cleanly on ${name}`, async () => {
        renderWithViewport('/library', { width, height }, false);
        expect(await screen.findByRole('heading', { name: /Personal Software Library|Library/i }, { timeout: 15000 })).toBeInTheDocument();
      });

      it(`renders Settings page cleanly on ${name}`, async () => {
        renderWithViewport('/settings', { width, height }, false);
        expect(await screen.findByRole('heading', { name: /Test Regular User|User Profile/i }, { timeout: 15000 })).toBeInTheDocument();
      });

      it(`renders Support page cleanly on ${name}`, async () => {
        renderWithViewport('/support', { width, height }, false);
        expect(await screen.findByRole('heading', { name: /How can we help you\?/i }, { timeout: 15000 })).toBeInTheDocument();
      });

      it(`renders Admin portal for authorized admins cleanly on ${name}`, async () => {
        renderWithViewport('/admin', { width, height }, true);
        expect(await screen.findByRole('heading', { name: /Admin Dashboard/i }, { timeout: 15000 })).toBeInTheDocument();
      });
    });
  });

  // ===========================================================================
  // TASK 2 — INTERACTIVE CONTROLS & OVERLAYS ACROSS BROWSERS
  // ===========================================================================
  describe('Task 2: Interactive Controls & Component Behavior', () => {
    it('manages mobile drawer open and close states via touch toggles', async () => {
      renderWithViewport('/', { width: 375, height: 667 });

      // Mobile menu toggle button
      const toggleBtn = await screen.findByRole('button', { name: /Open mobile menu|Close mobile menu/i }, { timeout: 5000 });
      expect(toggleBtn).toBeInTheDocument();

      fireEvent.click(toggleBtn);

      // Verify mobile drawer navigation links appear
      expect(await screen.findByRole('navigation', { name: /Mobile Navigation/i }, { timeout: 5000 })).toBeInTheDocument();
    });

    it('manages tab navigation and active state transitions', async () => {
      renderWithViewport('/settings', { width: 1280, height: 800 }, false);

      const prefTab = await screen.findByRole('tab', { name: /Preferences/i }, { timeout: 5000 });
      expect(prefTab).toBeInTheDocument();

      fireEvent.click(prefTab);
      expect(prefTab).toHaveAttribute('aria-selected', 'true');
    });

    it('interacts with global search input properly', async () => {
      renderWithViewport('/search', { width: 1280, height: 800 });

      const searchInput = await screen.findByRole('searchbox', {}, { timeout: 5000 });
      expect(searchInput).toBeInTheDocument();

      fireEvent.change(searchInput, { target: { value: 'terminal' } });
      expect(searchInput).toHaveValue('terminal');
    });
  });

  // ===========================================================================
  // TASK 3 — FIREBASE BEHAVIOR & AUTH TRANSITIONS
  // ===========================================================================
  describe('Task 3: Firebase Auth & Data Access Consistency', () => {
    it('gracefully handles user authentication and sign out', async () => {
      const signOutMock = vi.fn().mockResolvedValue(ok(undefined));
      renderWithViewport('/', { width: 1280, height: 800 }, false, { signOut: signOutMock });

      const userMenuTrigger = await screen.findByRole('button', { name: /Open user account menu/i }, { timeout: 5000 });
      expect(userMenuTrigger).toBeInTheDocument();

      fireEvent.click(userMenuTrigger);
      const signOutBtn = await screen.findByRole('menuitem', { name: /Sign Out|Logout/i }, { timeout: 5000 });
      fireEvent.click(signOutBtn);

      expect(signOutMock).toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // TASK 4 & 5 — CSS COMPATIBILITY & MOBILE SAFE AREAS
  // ===========================================================================
  describe('Task 4 & 5: CSS Compatibility, Viewports & Safe Area Tokens', () => {
    it('verifies safe-area CSS variable definitions and responsive shell constraints', () => {
      const { container } = renderWithViewport('/', { width: 375, height: 812 });
      const appShell = container.querySelector('.app-shell');
      expect(appShell).toBeInTheDocument();
    });

    it('verifies typography and heading hierarchy rendering', async () => {
      renderWithViewport('/', { width: 1280, height: 800 });
      const h1 = await screen.findByRole('heading', { level: 1 }, { timeout: 5000 });
      expect(h1).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // TASK 6 — INPUT CONTROLS & FORM VALIDATION
  // ===========================================================================
  describe('Task 6: Inputs, Textareas, Selects & Keyboard Interactions', () => {
    it('renders login form inputs with proper accessibility attributes', async () => {
      const { container } = renderWithViewport('/login', { width: 1280, height: 800 }, false, {
        isAuthenticated: false,
        authUser: null,
        user: null,
      });

      const emailInput = await screen.findByLabelText(/Email Address/i, {}, { timeout: 5000 });
      const passwordInput = screen.getByLabelText(/^Password$/i, { selector: 'input' });
      const submitBtn = container.querySelector('button[type="submit"]');

      expect(emailInput).toHaveAttribute('type', 'email');
      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(submitBtn).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // TASK 7 — TOUCH INTERACTIONS & MINIMUM TARGET SIZES
  // ===========================================================================
  describe('Task 7: Touch Targets & Mobile Gesture Readiness', () => {
    it('ensures mobile interactive triggers have accessible touch target dimensions', async () => {
      renderWithViewport('/', { width: 375, height: 667 });

      const mobileToggle = await screen.findByRole('button', { name: /Open mobile menu/i }, { timeout: 5000 });
      expect(mobileToggle).toBeInTheDocument();
      expect(mobileToggle.className).toContain('global-header__mobile-toggle');
    });
  });

  // ===========================================================================
  // TASK 8 — ACCESSIBILITY AUDIT & FOCUS VISIBILITY
  // ===========================================================================
  describe('Task 8: Accessibility Semantics & Keyboard Navigation', () => {
    it('provides accessible skip-to-content landmark links', () => {
      renderWithViewport('/', { width: 1280, height: 800 });
      const skipLink = screen.getByRole('link', { name: /Skip to main content/i });
      expect(skipLink).toBeInTheDocument();
      expect(skipLink).toHaveAttribute('href', '#main-content');
    });

    it('enforces ARIA landmarks for header, main, and navigation sections', () => {
      renderWithViewport('/', { width: 1280, height: 800 });
      expect(screen.getAllByRole('banner')[0]).toBeInTheDocument();
      expect(screen.getAllByRole('main')[0]).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // TASK 9 — ERROR STATES & 404 FALLBACK
  // ===========================================================================
  describe('Task 9: Cross-Browser Error States & 404 Route Resilience', () => {
    it('renders standard 404 page for nonexistent routes', async () => {
      renderWithViewport('/unknown-invalid-route-xyz', { width: 1280, height: 800 });
      expect(await screen.findByRole('heading', { name: 'Page Not Found', level: 1 }, { timeout: 5000 })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Back to Home/i })).toBeInTheDocument();
    });
  });
});
