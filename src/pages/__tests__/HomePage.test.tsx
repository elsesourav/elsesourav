import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { HomePage } from '../HomePage';
import * as useAppsModule from '@/hooks/useApps';
import * as useCategoriesModule from '@/hooks/useCategories';
import * as useUserLibraryModule from '@/hooks/useUserLibrary';
import * as useAuthModule from '@/hooks/useAuth';
import { analyticsService } from '@/services/analytics.service';
import { AppError } from '@/lib/errors';
import type { App } from '@/types/app.types';
import type { Category } from '@/types/category.types';

const mockFeaturedApps: App[] = [
  {
    id: 'app-flow',
    slug: 'codeflow-ide',
    name: 'CodeFlow IDE',
    shortDescription: 'Modern web development environment in the browser.',
    description: 'Full featured cloud IDE.',
    iconUrl: 'https://cdn.elsesourav.com/flow.png',
    primaryCategory: 'developer-tools',
    tags: ['ide', 'code'],
    status: 'published',
    platforms: ['web'],
    links: [
      {
        id: 'l1',
        appId: 'app-flow',
        platform: 'web',
        label: 'Open App',
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
  },
];

const mockTrendingApps: App[] = [
  {
    id: 'app-flow',
    slug: 'codeflow-ide',
    name: 'CodeFlow IDE',
    shortDescription: 'Modern web development environment in the browser.',
    description: 'Full featured cloud IDE.',
    iconUrl: 'https://cdn.elsesourav.com/flow.png',
    primaryCategory: 'developer-tools',
    tags: ['ide', 'code'],
    status: 'published',
    platforms: ['web'],
    links: [],
    screenshots: [],
    stats: { views: 500, launches: 200, libraryAdds: 50, ratingAverage: 4.9 },
    isFeatured: true,
    isPinned: false,
    sortOrder: 1,
    createdAt: 1700000000000,
    updatedAt: 1700005000000,
    publishedAt: 1700001000000,
  },
  {
    id: 'app-calc',
    slug: 'quick-calc',
    name: 'Quick Calc',
    shortDescription: 'Instant popup math calculator for Chrome.',
    description: 'Fast math extension.',
    iconUrl: 'https://cdn.elsesourav.com/calc.png',
    primaryCategory: 'utilities',
    tags: ['calculator', 'math'],
    status: 'published',
    platforms: ['chrome'],
    links: [],
    screenshots: [],
    stats: { views: 100, launches: 50, libraryAdds: 10, ratingAverage: 4.5 },
    isFeatured: false,
    isPinned: false,
    sortOrder: 2,
    createdAt: 1700002000000,
    updatedAt: 1700003000000,
    publishedAt: 1700002000000,
  },
];

const mockLatestApps: App[] = [
  {
    id: 'app-calc',
    slug: 'quick-calc',
    name: 'Quick Calc',
    shortDescription: 'Instant popup math calculator for Chrome.',
    description: 'Fast math extension.',
    iconUrl: 'https://cdn.elsesourav.com/calc.png',
    primaryCategory: 'utilities',
    tags: ['calculator', 'math'],
    status: 'published',
    platforms: ['chrome'],
    links: [],
    screenshots: [],
    stats: { views: 100, launches: 50, libraryAdds: 10, ratingAverage: 4.5 },
    isFeatured: false,
    isPinned: false,
    sortOrder: 2,
    createdAt: 1700002000000,
    updatedAt: 1700003000000,
    publishedAt: 1700002000000,
  },
];

const mockCategories: Category[] = [
  {
    id: 'cat-dev',
    slug: 'developer-tools',
    name: 'Developer Tools',
    description: 'IDEs, CLI utilities, debuggers',
    orderIndex: 0,
    isActive: true,
    createdAt: 100,
    updatedAt: 100,
  },
  {
    id: 'cat-util',
    slug: 'utilities',
    name: 'Productivity & Utilities',
    description: 'Calculators, helpers, workflows',
    orderIndex: 1,
    isActive: true,
    createdAt: 100,
    updatedAt: 100,
  },
];

describe('HomePage Component', () => {
  const mockRefetchFeatured = vi.fn();
  const mockRefetchTrending = vi.fn();
  const mockRefetchLatest = vi.fn();
  const mockRefetchCategories = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(analyticsService, 'trackView').mockResolvedValue(undefined);

    vi.spyOn(useUserLibraryModule, 'useUserLibrary').mockReturnValue({
      savedAppIds: new Set(),
      isSaved: vi.fn().mockReturnValue(false),
      saveApp: vi.fn(),
      removeApp: vi.fn(),
      toggleSave: vi.fn(),
      libraryItems: [],
      libraryCount: 0,
      isLoading: false,
      refreshLibrary: vi.fn(),
    });

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

    vi.spyOn(useAppsModule, 'useFeaturedApps').mockReturnValue({
      apps: mockFeaturedApps,
      hasMore: false,
      isLoading: false,
      error: null,
      refetch: mockRefetchFeatured,
    });

    vi.spyOn(useAppsModule, 'useTrendingApps').mockReturnValue({
      apps: mockTrendingApps,
      hasMore: false,
      isLoading: false,
      error: null,
      refetch: mockRefetchTrending,
    });

    vi.spyOn(useAppsModule, 'useLatestApps').mockReturnValue({
      apps: mockLatestApps,
      hasMore: false,
      isLoading: false,
      error: null,
      refetch: mockRefetchLatest,
    });

    vi.spyOn(useCategoriesModule, 'useCategories').mockReturnValue({
      categories: mockCategories,
      isLoading: false,
      error: null,
      refetch: mockRefetchCategories,
    });
  });

  it('1. Renders Hero section with headline, description, badge, and CTA buttons', () => {
    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /serious software, built by someone who cares\./i,
      })
    ).toBeInTheDocument();
    expect(screen.getByText(/independent software studio/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /explore apps/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /meet the creator/i })).toBeInTheDocument();
  });

  it('2. Directs primary CTA to /apps and secondary CTA to /about', () => {
    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );

    const exploreLink = screen.getByRole('link', { name: /explore all applications/i });
    expect(exploreLink).toHaveAttribute('href', '/apps');

    const aboutLink = screen.getByRole('link', { name: /learn more about the creator/i });
    expect(aboutLink).toHaveAttribute('href', '/about');
  });

  it('3. Renders featured applications section when data is loaded', () => {
    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );

    expect(
      screen.getByRole('heading', { level: 2, name: /featured applications/i })
    ).toBeInTheDocument();
  });

  it('4. Renders popular right now (trending apps) section with rank badges', () => {
    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );

    expect(
      screen.getByRole('heading', { level: 2, name: /popular right now/i })
    ).toBeInTheDocument();
    expect(screen.getByText('#1')).toBeInTheDocument();
    expect(screen.getByText('#2')).toBeInTheDocument();
  });

  it('5. Renders latest releases & updates section with update card and links', () => {
    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );

    expect(
      screen.getByRole('heading', { level: 2, name: /latest releases & updates/i })
    ).toBeInTheDocument();
    expect(screen.getAllByText('Quick Calc').length).toBeGreaterThan(0);

    const updateLink = screen.getByRole('link', {
      name: /view quick calc update: instant popup math calculator for chrome\./i,
    });
    expect(updateLink).toHaveAttribute('href', '/apps/quick-calc');

    // Click update card to verify non-blocking telemetry
    fireEvent.click(updateLink);
    expect(analyticsService.trackView).toHaveBeenCalledWith('app-calc', {
      source: 'home_latest_updates',
    });
  });

  it('6. Renders dynamic categories discovery section and generates correct URL', () => {
    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );

    expect(
      screen.getByRole('heading', { level: 2, name: /explore by category/i })
    ).toBeInTheDocument();
    expect(screen.getByText('Developer Tools')).toBeInTheDocument();
    expect(screen.getByText('IDEs, CLI utilities, debuggers')).toBeInTheDocument();

    const devCatLink = screen.getByRole('link', {
      name: /explore developer tools software category/i,
    });
    expect(devCatLink).toHaveAttribute('href', '/apps?category=developer-tools');

    fireEvent.click(devCatLink);
    expect(analyticsService.trackView).toHaveBeenCalledWith('cat-dev', {
      source: 'home_category_discovery',
    });
  });

  it('7. Shows loading skeletons during featured, trending, updates, and categories loading', () => {
    vi.spyOn(useAppsModule, 'useFeaturedApps').mockReturnValue({
      apps: [],
      hasMore: false,
      isLoading: true,
      error: null,
      refetch: mockRefetchFeatured,
    });

    vi.spyOn(useAppsModule, 'useTrendingApps').mockReturnValue({
      apps: [],
      hasMore: false,
      isLoading: true,
      error: null,
      refetch: mockRefetchTrending,
    });

    vi.spyOn(useAppsModule, 'useLatestApps').mockReturnValue({
      apps: [],
      hasMore: false,
      isLoading: true,
      error: null,
      refetch: mockRefetchLatest,
    });

    vi.spyOn(useCategoriesModule, 'useCategories').mockReturnValue({
      categories: [],
      isLoading: true,
      error: null,
      refetch: mockRefetchCategories,
    });

    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );

    expect(screen.getByTestId('home-featured-skeleton')).toBeInTheDocument();
    expect(screen.getByTestId('home-trending-skeleton')).toBeInTheDocument();
    expect(screen.getByTestId('home-updates-skeleton')).toBeInTheDocument();
    expect(screen.getByTestId('home-categories-skeleton')).toBeInTheDocument();
  });

  it('8. Handles trending error gracefully with localized retry button', () => {
    vi.spyOn(useAppsModule, 'useTrendingApps').mockReturnValue({
      apps: [],
      hasMore: false,
      isLoading: false,
      error: AppError.internal('Failed to load trending'),
      refetch: mockRefetchTrending,
    });

    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );

    expect(screen.getByText('Popular Apps Unavailable')).toBeInTheDocument();

    const retryBtns = screen.getAllByRole('button', { name: /retry/i });
    expect(retryBtns[0]).toBeDefined();
    fireEvent.click(retryBtns[0]!);
    expect(mockRefetchTrending).toHaveBeenCalled();
  });

  it('9. Renders creator spotlight and support banner', () => {
    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );

    expect(
      screen.getByRole('heading', { level: 2, name: /crafted with care by sourav/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: /have an idea or need support\?/i })
    ).toBeInTheDocument();
  });

  it('10. Sets document title and injects JSON-LD structured data', () => {
    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );

    expect(document.title).toContain('ElseSourav - Serious Software, Built by Someone Who Cares');
    const jsonLd = document.getElementById('json-ld-website');
    expect(jsonLd).not.toBeNull();
    expect(jsonLd?.textContent).toContain('ElseSourav');
  });
});
