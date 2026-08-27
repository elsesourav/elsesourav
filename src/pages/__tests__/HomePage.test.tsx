import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { HomePage } from '../HomePage';
import * as useAppsModule from '@/hooks/useApps';
import * as useUserLibraryModule from '@/hooks/useUserLibrary';
import * as useAuthModule from '@/hooks/useAuth';
import { analyticsService } from '@/services/analytics.service';
import { AppError } from '@/lib/errors';
import type { App } from '@/types/app.types';

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

describe('HomePage Component', () => {
  const mockRefetchFeatured = vi.fn();
  const mockRefetchLatest = vi.fn();

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

    vi.spyOn(useAppsModule, 'useLatestApps').mockReturnValue({
      apps: mockLatestApps,
      hasMore: false,
      isLoading: false,
      error: null,
      refetch: mockRefetchLatest,
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
    expect(screen.getByText('CodeFlow IDE')).toBeInTheDocument();
  });

  it('4. Renders latest releases & updates section with update card and links', () => {
    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );

    expect(
      screen.getByRole('heading', { level: 2, name: /latest releases & updates/i })
    ).toBeInTheDocument();
    expect(screen.getByText('Quick Calc')).toBeInTheDocument();
    expect(screen.getByText('Instant popup math calculator for Chrome.')).toBeInTheDocument();

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

  it('5. Shows loading skeletons during featured apps and latest updates loading', () => {
    vi.spyOn(useAppsModule, 'useFeaturedApps').mockReturnValue({
      apps: [],
      hasMore: false,
      isLoading: true,
      error: null,
      refetch: mockRefetchFeatured,
    });

    vi.spyOn(useAppsModule, 'useLatestApps').mockReturnValue({
      apps: [],
      hasMore: false,
      isLoading: true,
      error: null,
      refetch: mockRefetchLatest,
    });

    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );

    expect(screen.getByTestId('home-featured-skeleton')).toBeInTheDocument();
    expect(screen.getByTestId('home-updates-skeleton')).toBeInTheDocument();
  });

  it('6. Handles featured apps error gracefully without breaking latest updates', () => {
    vi.spyOn(useAppsModule, 'useFeaturedApps').mockReturnValue({
      apps: [],
      hasMore: false,
      isLoading: false,
      error: AppError.internal('Failed to fetch featured'),
      refetch: mockRefetchFeatured,
    });

    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );

    expect(screen.getByText('Featured Apps Unavailable')).toBeInTheDocument();
    expect(screen.getByText('Quick Calc')).toBeInTheDocument();

    const retryBtn = screen.getByRole('button', { name: /retry/i });
    fireEvent.click(retryBtn);
    expect(mockRefetchFeatured).toHaveBeenCalled();
  });

  it('7. Handles latest updates error gracefully without breaking featured apps', () => {
    vi.spyOn(useAppsModule, 'useLatestApps').mockReturnValue({
      apps: [],
      hasMore: false,
      isLoading: false,
      error: AppError.internal('Failed to fetch updates'),
      refetch: mockRefetchLatest,
    });

    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );

    expect(screen.getByText('Latest Updates Unavailable')).toBeInTheDocument();
    expect(screen.getByText('CodeFlow IDE')).toBeInTheDocument();

    const retryBtn = screen.getByRole('button', { name: /retry/i });
    fireEvent.click(retryBtn);
    expect(mockRefetchLatest).toHaveBeenCalled();
  });

  it('8. Renders categories preview, creator spotlight, and support banner', () => {
    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );

    expect(
      screen.getByRole('heading', { level: 2, name: /browse by category/i })
    ).toBeInTheDocument();
    expect(screen.getByText('Developer Tools')).toBeInTheDocument();
    expect(screen.getByText('Productivity & Utilities')).toBeInTheDocument();

    expect(
      screen.getByRole('heading', { level: 2, name: /crafted with care by sourav/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: /have an idea or need support\?/i })
    ).toBeInTheDocument();
  });

  it('9. Sets document title and injects JSON-LD structured data', () => {
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
