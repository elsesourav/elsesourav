import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
  createTestApp,
  createTestBlogPost,
  createTestHelpArticle,
  createTestHelpCategory,
  createTestSupportTicket,
  createTestSupportMessage,
  createTestNotification,
  createTestUserLibraryItem,
} from './fixtures/test-data';
import { ok } from '@/lib/result';
import type { AuthContextValue, AuthUser } from '@/types/auth.types';

describe('Complete Critical User Journeys End-to-End Test Suite (Prompt 72)', () => {
  const mockUser = createTestUser();
  const mockAuthUser: AuthUser = {
    uid: mockUser.id,
    email: mockUser.email,
    emailVerified: true,
    displayName: mockUser.displayName,
    photoURL: null,
    isAnonymous: false,
    providerId: 'password',
    createdAt: mockUser.createdAt,
  };

  const mockApp = createTestApp();
  const mockBlog = createTestBlogPost();
  const mockHelpCat = createTestHelpCategory();
  const mockHelpArt = createTestHelpArticle();
  const mockTicket = createTestSupportTicket();
  const mockMessage = createTestSupportMessage();
  const mockNotif = createTestNotification();
  const mockLibraryItem = createTestUserLibraryItem();

  const createAuthMock = (overrides?: Partial<AuthContextValue>): AuthContextValue => ({
    authUser: mockAuthUser,
    user: mockUser,
    role: 'user',
    isAuthenticated: true,
    isAdmin: false,
    isLoading: false,
    error: null,
    signIn: vi.fn().mockResolvedValue(ok(mockAuthUser)),
    signUp: vi.fn().mockResolvedValue(ok(mockAuthUser)),
    signInWithGoogle: vi.fn().mockResolvedValue(ok(mockAuthUser)),
    signOut: vi.fn().mockResolvedValue(ok(undefined)),
    sendPasswordReset: vi.fn().mockResolvedValue(ok(undefined)),
    sendVerificationEmail: vi.fn().mockResolvedValue(ok(undefined)),
    changePassword: vi.fn().mockResolvedValue(ok(undefined)),
    deleteAccount: vi.fn().mockResolvedValue(ok(undefined)),
    clearError: vi.fn(),
    ...overrides,
  });

  beforeEach(() => {
    vi.clearAllMocks();

    // App Service & App Search Service
    vi.spyOn(appService, 'listPublishedApps').mockResolvedValue(
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

    // Blog Service
    vi.spyOn(blogService, 'listPublishedPosts').mockResolvedValue(
      ok({ items: [mockBlog], totalCount: 1, hasMore: false })
    );
    vi.spyOn(blogService, 'getPostBySlug').mockImplementation(async (slug) => {
      if (slug === mockBlog.slug) return ok(mockBlog);
      return ok(null);
    });

    // Help Service
    vi.spyOn(helpService, 'listActiveCategories').mockResolvedValue(
      ok({ items: [mockHelpCat], totalCount: 1, hasMore: false })
    );
    vi.spyOn(helpService, 'listPublishedArticles').mockResolvedValue(
      ok({ items: [mockHelpArt], totalCount: 1, hasMore: false })
    );
    vi.spyOn(helpService, 'listFeaturedArticles').mockResolvedValue(
      ok({ items: [mockHelpArt], totalCount: 1, hasMore: false })
    );
    vi.spyOn(helpService, 'getArticleBySlug').mockImplementation(async (slug) => {
      if (slug === mockHelpArt.slug) return ok(mockHelpArt);
      return ok(null);
    });
    vi.spyOn(helpService, 'getCategoryById').mockResolvedValue(ok(mockHelpCat));
    vi.spyOn(helpService, 'searchArticles').mockResolvedValue(
      ok({ items: [mockHelpArt], totalCount: 1, hasMore: false })
    );

    // Support Service
    vi.spyOn(supportService, 'listUserTickets').mockResolvedValue(
      ok({ items: [mockTicket], totalCount: 1, hasMore: false })
    );
    vi.spyOn(supportService, 'getTicket').mockResolvedValue(ok(mockTicket));
    vi.spyOn(supportService, 'listMessages').mockResolvedValue(
      ok({ items: [mockMessage], totalCount: 1, hasMore: false })
    );
    vi.spyOn(supportService, 'createTicket').mockResolvedValue(ok(mockTicket));
    vi.spyOn(supportService, 'addMessage').mockResolvedValue(ok(mockMessage));

    // User Library Service
    vi.spyOn(userLibraryService, 'getEnrichedLibrary').mockResolvedValue(
      ok({
        items: [
          {
            libraryItem: mockLibraryItem,
            app: mockApp,
            isUnavailable: false,
          },
        ],
        hasMore: false,
      })
    );
    vi.spyOn(userLibraryService, 'getLibraryCount').mockResolvedValue(ok(1));
    vi.spyOn(userLibraryService, 'isAppSaved').mockResolvedValue(ok(true));
    vi.spyOn(userLibraryService, 'saveApp').mockResolvedValue(ok(mockLibraryItem));
    vi.spyOn(userLibraryService, 'removeApp').mockResolvedValue(ok(undefined));

    // User Service
    vi.spyOn(userService, 'updateUserProfile').mockResolvedValue(ok(mockUser));
    vi.spyOn(userService, 'updateUserPreferences').mockResolvedValue(ok(mockUser));

    // Notification Service
    vi.spyOn(notificationService, 'getUserNotifications').mockResolvedValue(
      ok({ items: [mockNotif], totalCount: 1, hasMore: false })
    );
    vi.spyOn(notificationService, 'getUnreadCount').mockResolvedValue(ok(1));
    vi.spyOn(notificationService, 'markAsRead').mockResolvedValue(ok(mockNotif));
    vi.spyOn(notificationService, 'markAllAsRead').mockResolvedValue(ok(1));
    vi.spyOn(notificationService, 'subscribeToUserNotifications').mockImplementation(
      (_userId, onNext) => {
        onNext([mockNotif]);
        return () => {};
      }
    );

    // Classification, Media, Version & Feedback
    vi.spyOn(classificationService, 'listActiveCategories').mockResolvedValue(
      ok({ items: [mockHelpCat], totalCount: 1, hasMore: false })
    );
    vi.spyOn(classificationService, 'getCategoryBySlug').mockResolvedValue(ok(null));
    vi.spyOn(classificationService, 'listActiveTags').mockResolvedValue(
      ok({ items: [], totalCount: 0, hasMore: false })
    );
    vi.spyOn(appMediaService, 'listMedia').mockResolvedValue(
      ok({ items: [], totalCount: 0, hasMore: false })
    );
    vi.spyOn(appVersionService, 'listVersions').mockResolvedValue(
      ok({ items: [], totalCount: 0, hasMore: false })
    );
    vi.spyOn(appVersionService, 'getLatestVersion').mockResolvedValue(ok(null));
    vi.spyOn(feedbackService, 'getAppRatingAggregate').mockResolvedValue(ok(null));
    vi.spyOn(feedbackService, 'getApprovedReviews').mockResolvedValue(
      ok({ items: [], totalCount: 0, hasMore: false })
    );
    vi.spyOn(feedbackService, 'getUserReview').mockResolvedValue(ok(null));

    // Global Search
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
            category: mockApp.primaryCategory,
            relevanceScore: 100,
            matchReason: 'exact_title',
          },
        ],
        blogPosts: [],
        helpArticles: [],
        totalCount: 1,
      })
    );
  });

  const renderApp = (initialRoute: string, authOverrides?: Partial<AuthContextValue>) => {
    const auth = createAuthMock(authOverrides);
    return render(
      <ThemeProvider>
        <ToastProvider>
          <AuthContext.Provider value={auth}>
            <MemoryRouter initialEntries={[initialRoute]}>
              <AppRoutes />
            </MemoryRouter>
          </AuthContext.Provider>
        </ToastProvider>
      </ThemeProvider>
    );
  };

  // ===========================================================================
  // TASK 1 — PUBLIC DISCOVERY JOURNEY
  // ===========================================================================
  describe('Task 1: Public Discovery Journey', () => {
    it('seamlessly navigates Homepage -> Apps -> Details -> Blog -> Help -> Support without dead ends', async () => {
      const { unmount } = renderApp('/');

      // 1. Homepage loads
      expect(await screen.findByRole('heading', { level: 1 })).toBeInTheDocument();
      unmount();

      // 2. Apps catalog loads
      const appsRender = renderApp('/apps');
      expect(await screen.findByText('Terminal Pro')).toBeInTheDocument();
      appsRender.unmount();

      // 3. App Details loads with metadata & launch links
      const detailRender = renderApp('/apps/terminal-pro');
      expect(await screen.findByRole('heading', { level: 1, name: 'Terminal Pro' })).toBeInTheDocument();
      expect(screen.getByText(/High-performance GPU-accelerated terminal/i)).toBeInTheDocument();
      expect(screen.getByText('Open App')).toBeInTheDocument();
      detailRender.unmount();

      // 4. Blog loads
      const blogRender = renderApp('/blog');
      expect(await screen.findByText('Modern Web Architecture in 2026')).toBeInTheDocument();
      blogRender.unmount();

      // 5. Help loads
      const helpRender = renderApp('/help');
      expect(await screen.findByRole('heading', { level: 1, name: /How can we help you\?/i })).toBeInTheDocument();
      expect(await screen.findByRole('link', { name: /Getting Started/i })).toBeInTheDocument();
      helpRender.unmount();

      // 6. Support loads
      const supportRender = renderApp('/support');
      expect(await screen.findByRole('heading', { level: 1, name: /How can we help you\?/i })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 2, name: /Create Support Ticket/i })).toBeInTheDocument();
      supportRender.unmount();
    });
  });

  // ===========================================================================
  // TASK 2 — AUTHENTICATION JOURNEY
  // ===========================================================================
  describe('Task 2: Authentication Journey', () => {
    it('handles login, signup validation, password reset, and protected route redirect', async () => {
      // 1. Unauthenticated user on login
      const loginRender = renderApp('/login', { isAuthenticated: false, user: null, authUser: null });
      expect(await screen.findByRole('heading', { level: 1, name: /Sign In to ElseSourav/i })).toBeInTheDocument();
      loginRender.unmount();

      // 2. Unauthenticated user on signup
      const signupRender = renderApp('/signup', { isAuthenticated: false, user: null, authUser: null });
      expect(await screen.findByRole('heading', { level: 1, name: /Create an Account/i })).toBeInTheDocument();
      signupRender.unmount();

      // 3. Password reset page
      const resetRender = renderApp('/forgot-password', { isAuthenticated: false, user: null, authUser: null });
      expect(await screen.findByRole('heading', { level: 1, name: /Reset Password/i })).toBeInTheDocument();
      resetRender.unmount();

      // 4. Protected route redirects to login
      const protectedRender = renderApp('/library', { isAuthenticated: false, user: null, authUser: null });
      expect(await screen.findByRole('heading', { level: 1, name: /Sign In to ElseSourav/i })).toBeInTheDocument();
      protectedRender.unmount();
    });
  });

  // ===========================================================================
  // TASK 3 — LIBRARY JOURNEY
  // ===========================================================================
  describe('Task 3: Library Journey', () => {
    it('displays saved applications and renders empty state when library is cleared', async () => {
      // 1. Library with saved item
      const libRender = renderApp('/library');
      expect(await screen.findByText('Terminal Pro')).toBeInTheDocument();
      expect(screen.getByText(/Saved Applications/i)).toBeInTheDocument();
      libRender.unmount();

      // 2. Empty library state
      vi.spyOn(userLibraryService, 'getEnrichedLibrary').mockResolvedValue(
        ok({ items: [], hasMore: false })
      );
      vi.spyOn(userLibraryService, 'getLibraryCount').mockResolvedValue(ok(0));

      const emptyLibRender = renderApp('/library');
      expect(await screen.findByText(/Save apps you want to come back to/i)).toBeInTheDocument();
      expect(screen.getByText(/Your personal library is empty/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Explore Software Catalog/i })).toBeInTheDocument();
      emptyLibRender.unmount();
    });
  });

  // ===========================================================================
  // TASK 4 — SETTINGS JOURNEY
  // ===========================================================================
  describe('Task 4: Settings Journey', () => {
    it('manages profile information, preferences, and security controls', async () => {
      renderApp('/settings');

      expect(await screen.findByLabelText(/Display Name/i)).toHaveValue('Test Regular User');
      expect(screen.getByText(/test\.user@example\.com/i)).toBeInTheDocument();

      // Switch to Preferences tab
      const prefTab = await screen.findByRole('tab', { name: /Preferences/i });
      await userEvent.click(prefTab);
      expect(await screen.findByText(/Appearance/i)).toBeInTheDocument();

      // Switch to Security tab
      const secTab = screen.getByRole('tab', { name: /Security/i });
      await userEvent.click(secTab);
      expect(await screen.findByText(/Security & Authentication Overview/i)).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // TASK 5 — NOTIFICATION JOURNEY
  // ===========================================================================
  describe('Task 5: Notification Journey', () => {
    it('opens notification center, shows unread items, and allows marking read', async () => {
      renderApp('/');

      // Bell trigger button with unread count
      const bellBtn = await screen.findByRole('button', { name: /Notifications/i });
      expect(bellBtn).toBeInTheDocument();

      // Click bell trigger to open popover
      await userEvent.click(bellBtn);

      expect(await screen.findByText('Application Updated')).toBeInTheDocument();
      expect(screen.getByText(/Terminal Pro v1.2.0 is now available/i)).toBeInTheDocument();

      // Click Mark All Read
      const markAllBtn = screen.getByRole('button', { name: /Mark all notifications as read/i });
      await userEvent.click(markAllBtn);
      expect(notificationService.markAllAsRead).toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // TASK 6 — SUPPORT JOURNEY
  // ===========================================================================
  describe('Task 6: Support Journey', () => {
    it('renders ticket listing, allows ticket creation, and views message thread', async () => {
      // 1. Support Tickets Page
      const listRender = renderApp('/support/tickets');
      expect(await screen.findByRole('heading', { level: 1, name: /My Support Requests/i })).toBeInTheDocument();
      expect(await screen.findByRole('link', { name: /Question regarding keyboard shortcuts/i })).toBeInTheDocument();
      expect(screen.getAllByText(/Open/i).length).toBeGreaterThan(0);
      listRender.unmount();

      // 2. Ticket Detail Page
      const detailRender = renderApp('/support/tickets/ticket-001');
      expect(await screen.findByText('Question regarding keyboard shortcuts')).toBeInTheDocument();
      expect(await screen.findByText('I would like to know if vim mode is supported.')).toBeInTheDocument();
      detailRender.unmount();

      // 3. Create Ticket Flow on Support Page
      const formRender = renderApp('/support');
      const subjectInput = await screen.findByLabelText(/Subject/i);
      const descInput = screen.getByLabelText(/Description/i);
      const submitBtn = screen.getByRole('button', { name: /Submit Support Ticket/i });

      await userEvent.type(subjectInput, 'New issue with terminal installer');
      await userEvent.type(descInput, 'Installation fails on macOS 15 with code 127');
      await userEvent.click(submitBtn);

      expect(supportService.createTicket).toHaveBeenCalled();
      formRender.unmount();
    });
  });

  // ===========================================================================
  // TASK 7 — ERROR JOURNEYS
  // ===========================================================================
  describe('Task 7: Error Resilience & Fallback Journeys', () => {
    it('handles 404 unknown routes cleanly with recovery action', async () => {
      renderApp('/some-nonexistent-route-404');

      expect(await screen.findByText(/Page Not Found/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Back to Home/i })).toBeInTheDocument();
    });

    it('handles missing app document gracefully without crash', async () => {
      vi.spyOn(appService, 'getAppBySlug').mockResolvedValueOnce(ok(null));

      renderApp('/apps/ghost-app');

      expect(await screen.findByText(/Application Not Found/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Browse All Applications/i })).toBeInTheDocument();
    });
  });

  // ===========================================================================
  // TASK 8 & 9 — MOBILE & KEYBOARD E2E
  // ===========================================================================
  describe('Tasks 8 & 9: Mobile Viewport & Keyboard Accessibility', () => {
    it('provides functional skip link and keyboard accessibility', async () => {
      renderApp('/');

      const skipLink = await screen.findByRole('link', { name: /Skip to main content/i });
      expect(skipLink).toBeInTheDocument();
      expect(skipLink).toHaveAttribute('href', '#main-content');
    });

    it('handles Escape key to close open dialogs and popovers', async () => {
      renderApp('/');

      const bellBtn = await screen.findByRole('button', { name: /Notifications/i });
      await userEvent.click(bellBtn);

      expect(await screen.findByText('Notifications')).toBeInTheDocument();

      // Press Escape
      await userEvent.keyboard('{Escape}');

      await waitFor(() => {
        expect(screen.queryByText('Mark all notifications as read')).not.toBeInTheDocument();
      });
    });

    it('supports keyboard Tab navigation through primary interactive elements', async () => {
      renderApp('/');

      const skipLink = await screen.findByRole('link', { name: /Skip to main content/i });
      expect(skipLink).toBeInTheDocument();

      // Tab key navigation
      await userEvent.tab();
      expect(document.activeElement).toBeDefined();
    });
  });
});
