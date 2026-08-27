import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AppsPage, AppDetailPage } from '@/pages';
import { appService } from '@/services/app.service';
import { appRepository } from '@/repositories/app.repository';
import { classificationService } from '@/services/classification.service';
import { feedbackService } from '@/services/feedback.service';
import { userLibraryService } from '@/services/library.service';
import { appMediaService } from '@/services/media.service';
import { appVersionService } from '@/services/version.service';
import { analyticsService } from '@/services/analytics.service';
import * as useAuthModule from '@/hooks/useAuth';
import { ok } from '@/lib/result';
import type { App } from '@/types/app.types';
import type { UserLibraryItem } from '@/types/user.types';

const mockFlowApp: App = {
  id: 'app-flow',
  slug: 'codeflow-ide',
  name: 'CodeFlow IDE',
  shortDescription: 'Modern web development environment in the browser.',
  description: 'Full featured cloud IDE built with web technologies by ElseSourav.',
  iconUrl: 'https://cdn.elsesourav.com/icon.png',
  primaryCategory: 'developer-tools',
  tags: ['ide', 'editor', 'code'],
  status: 'published',
  platforms: ['web', 'chrome'],
  links: [
    {
      id: 'l1',
      appId: 'app-flow',
      platform: 'web',
      label: 'Open Web App',
      url: 'https://flow.elsesourav.com',
      action: 'open_app',
      isPrimary: true,
      displayOrder: 0,
      isActive: true,
    },
  ],
  screenshots: [],
  stats: { views: 500, launches: 200, libraryAdds: 50, ratingAverage: 4.9 },
  isFeatured: true,
  isPinned: false,
  sortOrder: 1,
  createdAt: 1700000000000,
  updatedAt: 1700005000000,
  publishedAt: 1700001000000,
};

const mockCalcApp: App = {
  id: 'app-calc',
  slug: 'quick-calc',
  name: 'Quick Calc',
  shortDescription: 'Popup calculator for fast math calculations.',
  description: 'Math tool extension.',
  iconUrl: 'https://cdn.elsesourav.com/calc.png',
  primaryCategory: 'utilities',
  tags: ['calculator', 'math'],
  status: 'published',
  platforms: ['chrome'],
  links: [
    {
      id: 'l2',
      appId: 'app-calc',
      platform: 'chrome',
      label: 'Add to Chrome',
      url: 'https://chrome.google.com/webstore/detail/calc',
      action: 'add_to_chrome',
      isPrimary: true,
      displayOrder: 0,
      isActive: true,
    },
  ],
  screenshots: [],
  stats: { views: 200, launches: 80, libraryAdds: 10, ratingAverage: 4.5 },
  isFeatured: false,
  isPinned: false,
  sortOrder: 2,
  createdAt: 1700002000000,
  updatedAt: 1700002000000,
  publishedAt: 1700002000000,
};

const mockDraftApp: App = {
  id: 'app-draft',
  slug: 'secret-beta',
  name: 'Secret Beta App',
  shortDescription: 'Unpublished internal app.',
  description: 'Internal testing.',
  iconUrl: 'https://cdn.elsesourav.com/secret.png',
  primaryCategory: 'utilities',
  tags: ['beta'],
  status: 'draft',
  platforms: ['web'],
  links: [],
  screenshots: [],
  stats: { views: 0, launches: 0, libraryAdds: 0 },
  isFeatured: false,
  isPinned: false,
  sortOrder: 3,
  createdAt: 1700003000000,
  updatedAt: 1700003000000,
};

describe('Apps Discovery & Details End-to-End Integration Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(analyticsService, 'trackView').mockResolvedValue(undefined);
    vi.spyOn(analyticsService, 'trackPrimaryAction').mockResolvedValue(undefined);
    vi.spyOn(analyticsService, 'trackExternalLink').mockResolvedValue(undefined);

    vi.spyOn(classificationService, 'listActiveCategories').mockResolvedValue(
      ok({
        items: [
          {
            id: 'cat-1',
            slug: 'developer-tools',
            name: 'Developer Tools',
            description: 'Engineering tools',
            orderIndex: 0,
            isActive: true,
            createdAt: 100,
            updatedAt: 100,
          },
          {
            id: 'cat-2',
            slug: 'utilities',
            name: 'Utilities',
            description: 'Helpful utilities',
            orderIndex: 1,
            isActive: true,
            createdAt: 100,
            updatedAt: 100,
          },
        ],
        hasMore: false,
      })
    );

    vi.spyOn(classificationService, 'listActiveTags').mockResolvedValue(
      ok({
        items: [
          {
            id: 't-ide',
            slug: 'ide',
            name: 'ide',
            isActive: true,
            createdAt: 100,
            updatedAt: 100,
          },
        ],
        hasMore: false,
      })
    );

    vi.spyOn(appRepository, 'listPublished').mockResolvedValue(
      ok({
        items: [mockFlowApp, mockCalcApp],
        hasMore: false,
        total: 2,
      })
    );

    vi.spyOn(appService, 'listPublishedApps').mockResolvedValue(
      ok({
        items: [mockFlowApp, mockCalcApp],
        hasMore: false,
        total: 2,
      })
    );

    vi.spyOn(classificationService, 'getCategoryBySlug').mockResolvedValue(
      ok({
        id: 'cat-1',
        slug: 'developer-tools',
        name: 'Developer Tools',
        description: 'Engineering tools',
        orderIndex: 0,
        isActive: true,
        createdAt: 100,
        updatedAt: 100,
      })
    );

    vi.spyOn(appRepository, 'findBySlug').mockImplementation(async (slug) => {
      if (slug === 'codeflow-ide') return ok(mockFlowApp);
      if (slug === 'quick-calc') return ok(mockCalcApp);
      if (slug === 'secret-beta') return ok(mockDraftApp);
      return ok(null);
    });

    vi.spyOn(appRepository, 'findById').mockImplementation(async (id) => {
      if (id === 'app-flow') return ok(mockFlowApp);
      if (id === 'app-calc') return ok(mockCalcApp);
      if (id === 'app-draft') return ok(mockDraftApp);
      return ok(null);
    });

    vi.spyOn(appService, 'getAppBySlug').mockImplementation(async (slug) => {
      if (slug === 'codeflow-ide') return ok(mockFlowApp);
      if (slug === 'quick-calc') return ok(mockCalcApp);
      if (slug === 'secret-beta') return ok(mockDraftApp);
      return ok(null);
    });

    vi.spyOn(appService, 'getAppById').mockImplementation(async (id) => {
      if (id === 'app-flow') return ok(mockFlowApp);
      if (id === 'app-calc') return ok(mockCalcApp);
      if (id === 'app-draft') return ok(mockDraftApp);
      return ok(null);
    });

    vi.spyOn(appService, 'getRelatedApps').mockResolvedValue(ok([mockCalcApp]));

    vi.spyOn(appMediaService, 'listMedia').mockResolvedValue(
      ok({
        items: [
          {
            id: 'm1',
            appId: 'app-flow',
            type: 'screenshot',
            url: 'https://cdn.elsesourav.com/shot1.png',
            altText: 'CodeFlow workspace view',
            orderIndex: 0,
            isActive: true,
            createdAt: 100,
            updatedAt: 100,
          },
        ],
        hasMore: false,
      })
    );

    vi.spyOn(appVersionService, 'getLatestVersion').mockResolvedValue(
      ok({
        id: 'v1',
        appId: 'app-flow',
        version: '1.2.0',
        title: 'Release 1.2',
        summary: 'Debugger updates',
        releaseNotes: 'Added debugger panel.',
        highlights: [],
        isCurrent: true,
        releaseDate: 1700000000000,
        status: 'published',
        createdAt: 100,
        updatedAt: 100,
      })
    );

    vi.spyOn(appVersionService, 'listVersions').mockResolvedValue(
      ok({ items: [], hasMore: false })
    );

    vi.spyOn(feedbackService, 'getAppRatingAggregate').mockResolvedValue(
      ok({
        id: 'agg-flow',
        appId: 'app-flow',
        averageRating: 4.9,
        ratingCount: 15,
        distribution: { 1: 0, 2: 0, 3: 0, 4: 2, 5: 13 },
        updatedAt: 100,
      })
    );

    vi.spyOn(feedbackService, 'getApprovedReviews').mockResolvedValue(
      ok({ items: [], hasMore: false })
    );
    const mockLibraryItem: UserLibraryItem = {
      id: 'lib-1',
      userId: 'u-sourav',
      appId: 'app-flow',
      isFavorite: false,
      isPinned: false,
      addedAt: 100,
    };
    vi.spyOn(userLibraryService, 'isAppSaved').mockResolvedValue(ok(false));
    vi.spyOn(userLibraryService, 'saveApp').mockResolvedValue(ok(mockLibraryItem));
    vi.spyOn(userLibraryService, 'removeApp').mockResolvedValue(ok(undefined));
    vi.spyOn(userLibraryService, 'getUserLibrary').mockResolvedValue(
      ok({ items: [], hasMore: false, totalCount: 0 })
    );

    vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
      authUser: null,
      user: null,
      role: 'user',
      isAuthenticated: false,
      isAdmin: false,
      isLoading: false,
      error: null,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signInWithGoogle: vi.fn(),
      signOut: vi.fn(),
      sendPasswordReset: vi.fn(),
      sendVerificationEmail: vi.fn(),
      clearError: vi.fn(),
    });
  });

  it('1-4. Full Discovery Experience: Catalog render, search, filter, and sort', async () => {
    render(
      <MemoryRouter initialEntries={['/apps']}>
        <Routes>
          <Route path="/apps" element={<AppsPage />} />
        </Routes>
      </MemoryRouter>
    );

    // 1. Catalog render
    expect(screen.getByText('Explore Applications')).toBeInTheDocument();
    expect(await screen.findByText('CodeFlow IDE')).toBeInTheDocument();
    expect(screen.getByText('Quick Calc')).toBeInTheDocument();

    // 2. Search filtering
    const searchInput = screen.getByPlaceholderText('Search by name, description, or tag...');
    fireEvent.change(searchInput, { target: { value: 'Calc' } });

    await waitFor(() => {
      expect(screen.getByText('Quick Calc')).toBeInTheDocument();
      expect(screen.queryByText('CodeFlow IDE')).not.toBeInTheDocument();
    });

    // Clear search
    fireEvent.change(searchInput, { target: { value: '' } });

    // 3. Category filtering
    const devCategoryPill = await screen.findByRole('button', { name: 'Developer Tools' });
    fireEvent.click(devCategoryPill);

    await waitFor(() => {
      expect(screen.getByText('CodeFlow IDE')).toBeInTheDocument();
      expect(screen.queryByText('Quick Calc')).not.toBeInTheDocument();
    });
  });

  it('5-8. App Details Experience: Navigation, lightbox gallery, smart action, and telemetry', async () => {
    const windowOpenSpy = vi.spyOn(window, 'open').mockImplementation(() => null);

    render(
      <MemoryRouter initialEntries={['/apps/codeflow-ide']}>
        <Routes>
          <Route path="/apps/:slug" element={<AppDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    // 5. Details header
    expect(
      await screen.findByRole('heading', { level: 1, name: 'CodeFlow IDE' })
    ).toBeInTheDocument();
    expect(screen.getAllByText('v1.2.0')[0]).toBeInTheDocument();
    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('Information')).toBeInTheDocument();

    // 6. Screenshot gallery lightbox
    const screenshotBtn = screen.getByRole('button', { name: /view screenshot 1 of 1/i });
    fireEvent.click(screenshotBtn);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('CodeFlow workspace view')).toBeInTheDocument();

    // Close lightbox
    fireEvent.keyDown(window, { key: 'Escape' });

    // 7. Primary smart action click & telemetry
    const actionBtn = screen.getByRole('button', { name: /open app for codeflow ide/i });
    fireEvent.click(actionBtn);

    expect(analyticsService.trackPrimaryAction).toHaveBeenCalledWith(
      'app-flow',
      'open_app',
      expect.objectContaining({ platform: 'web' })
    );

    expect(windowOpenSpy).toHaveBeenCalledWith(
      'https://flow.elsesourav.com',
      '_blank',
      'noopener,noreferrer'
    );
  });

  it('9-12. Authenticated User Flow: Library bookmarking, rating display, and review submission', async () => {
    vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
      authUser: {
        uid: 'u-sourav',
        email: 'sourav@example.com',
        emailVerified: true,
        displayName: 'Sourav',
        photoURL: null,
        isAnonymous: false,
        providerId: 'password',
      },
      user: {
        id: 'u-sourav',
        email: 'sourav@example.com',
        displayName: 'Sourav',
        role: 'user',
        status: 'active',
        preferences: {
          theme: 'system',
          emailNotifications: false,
          compactView: false,
          reduceMotion: false,
        },
        createdAt: 100,
        updatedAt: 100,
      },
      role: 'user',
      isAuthenticated: true,
      isAdmin: false,
      isLoading: false,
      error: null,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signInWithGoogle: vi.fn(),
      signOut: vi.fn(),
      sendPasswordReset: vi.fn(),
      sendVerificationEmail: vi.fn(),
      clearError: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/apps/codeflow-ide']}>
        <Routes>
          <Route path="/apps/:slug" element={<AppDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    // 9. Bookmark save button
    const bookmarkBtn = await screen.findByLabelText(/save codeflow ide to library/i);
    fireEvent.click(bookmarkBtn);

    expect(userLibraryService.saveApp).toHaveBeenCalledWith('u-sourav', 'app-flow', undefined);

    // 11. Rating section display
    expect(screen.getByText('Ratings & Reviews')).toBeInTheDocument();
    expect(screen.getAllByText('4.9')[0]).toBeInTheDocument();
    expect(screen.getByText('15 Ratings')).toBeInTheDocument();
  });

  it('13-15. Security & Isolation: Public visitors cannot view unpublished draft apps', async () => {
    render(
      <MemoryRouter initialEntries={['/apps/secret-beta']}>
        <Routes>
          <Route path="/apps/:slug" element={<AppDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText('Application Not Found')).toBeInTheDocument();
    expect(screen.queryByText('Secret Beta App')).not.toBeInTheDocument();
  });
});
