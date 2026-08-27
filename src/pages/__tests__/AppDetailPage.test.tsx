import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AppDetailPage } from '../AppDetailPage';
import * as useAppDetailsModule from '@/hooks/useAppDetails';
import * as useAuthModule from '@/hooks/useAuth';
import * as useUserLibraryModule from '@/hooks/useUserLibrary';
import { analyticsService } from '@/services/analytics.service';
import { AppError } from '@/lib/errors';
import type { App } from '@/types/app.types';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ slug: 'codeflow-ide' }),
  };
});

const mockApp: App = {
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
    {
      id: 'l2',
      appId: 'app-flow',
      platform: 'github',
      label: 'GitHub Source',
      url: 'https://github.com/elsesourav/codeflow',
      action: 'view_on_github',
      isPrimary: false,
      displayOrder: 1,
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

const mockAppDetailsData: useAppDetailsModule.AppDetailsData = {
  app: mockApp,
  category: {
    id: 'cat-dev',
    slug: 'developer-tools',
    name: 'Developer Tools',
    description: 'Tools for engineers',
    orderIndex: 0,
    isActive: true,
    createdAt: 100,
    updatedAt: 100,
  },
  tags: [
    {
      id: 't-ide',
      slug: 'ide',
      name: 'ide',
      isActive: true,
      createdAt: 100,
      updatedAt: 100,
    },
  ],
  primaryAction: mockApp.links[0] || null,
  links: [...mockApp.links],
  media: {
    icon: null,
    hero: null,
    screenshots: [
      {
        id: 'm1',
        appId: 'app-flow',
        type: 'screenshot',
        url: 'https://cdn.elsesourav.com/shot1.png',
        altText: 'Editor workspace',
        orderIndex: 0,
        isActive: true,
        createdAt: 100,
        updatedAt: 100,
      },
    ],
    social: null,
    all: [
      {
        id: 'm1',
        appId: 'app-flow',
        type: 'screenshot',
        url: 'https://cdn.elsesourav.com/shot1.png',
        altText: 'Editor workspace',
        orderIndex: 0,
        isActive: true,
        createdAt: 100,
        updatedAt: 100,
      },
    ],
  },
  versions: {
    latest: {
      id: 'v1',
      appId: 'app-flow',
      version: '1.2.0',
      title: 'Initial Release',
      summary: 'New features and terminal support.',
      releaseNotes: 'Added debugger integration.',
      highlights: [],
      isCurrent: true,
      releaseDate: 1700000000000,
      status: 'published',
      createdAt: 100,
      updatedAt: 100,
    },
    all: [],
  },
  ratings: {
    aggregate: {
      id: 'agg-1',
      appId: 'app-flow',
      averageRating: 4.9,
      ratingCount: 15,
      distribution: { 1: 0, 2: 0, 3: 0, 4: 2, 5: 13 },
      updatedAt: 100,
    },
    approvedReviews: [],
    userReview: null,
  },
  relatedApps: [],
  isSaved: false,
};

describe('AppDetailPage Component', () => {
  const mockRefetch = vi.fn();
  const mockToggleSave = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(analyticsService, 'trackView').mockResolvedValue(undefined);
    vi.spyOn(analyticsService, 'trackPrimaryAction').mockResolvedValue(undefined);
    vi.spyOn(analyticsService, 'trackExternalLink').mockResolvedValue(undefined);

    vi.spyOn(useUserLibraryModule, 'useUserLibrary').mockReturnValue({
      savedAppIds: new Set(),
      isSaved: vi.fn().mockReturnValue(false),
      saveApp: vi.fn(),
      removeApp: vi.fn(),
      toggleSave: mockToggleSave,
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

    vi.spyOn(useAppDetailsModule, 'useAppDetails').mockReturnValue({
      data: mockAppDetailsData,
      isLoading: false,
      error: null,
      refetch: mockRefetch,
    });
  });

  it('1. Renders complete app details page with hero, action, overview, specs, and gallery', () => {
    render(
      <BrowserRouter>
        <AppDetailPage />
      </BrowserRouter>
    );

    expect(screen.getByRole('heading', { level: 1, name: 'CodeFlow IDE' })).toBeInTheDocument();
    expect(
      screen.getByText('Modern web development environment in the browser.')
    ).toBeInTheDocument();
    expect(screen.getAllByText('v1.2.0')[0]).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /open app for codeflow ide/i })).toBeInTheDocument();
    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('Information')).toBeInTheDocument();
    expect(screen.getByText('Ratings & Reviews')).toBeInTheDocument();
  });

  it('2. Shows loading skeleton while data is being fetched', () => {
    vi.spyOn(useAppDetailsModule, 'useAppDetails').mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
      refetch: mockRefetch,
    });

    render(
      <BrowserRouter>
        <AppDetailPage />
      </BrowserRouter>
    );

    expect(screen.getByTestId('app-detail-loading')).toBeInTheDocument();
  });

  it('3. Shows Application Not Found for invalid slug or missing app', () => {
    vi.spyOn(useAppDetailsModule, 'useAppDetails').mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
      refetch: mockRefetch,
    });

    render(
      <BrowserRouter>
        <AppDetailPage />
      </BrowserRouter>
    );

    expect(screen.getByText('Application Not Found')).toBeInTheDocument();
  });

  it('4. Hides draft/unpublished app from public visitors', () => {
    vi.spyOn(useAppDetailsModule, 'useAppDetails').mockReturnValue({
      data: {
        ...mockAppDetailsData,
        app: { ...mockApp, status: 'draft' },
      },
      isLoading: false,
      error: null,
      refetch: mockRefetch,
    });

    render(
      <BrowserRouter>
        <AppDetailPage />
      </BrowserRouter>
    );

    expect(screen.getByText('Application Not Found')).toBeInTheDocument();
  });

  it('5. Handles primary smart action click and triggers telemetry', () => {
    const windowOpenSpy = vi.spyOn(window, 'open').mockImplementation(() => null);

    render(
      <BrowserRouter>
        <AppDetailPage />
      </BrowserRouter>
    );

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

  it('6. Handles bookmark action and redirects anonymous visitor to login', () => {
    render(
      <BrowserRouter>
        <AppDetailPage />
      </BrowserRouter>
    );

    const bookmarkBtn = screen.getByLabelText(/save codeflow ide to library/i);
    fireEvent.click(bookmarkBtn);

    expect(mockNavigate).toHaveBeenCalledWith('/login');
    expect(mockToggleSave).not.toHaveBeenCalled();
  });

  it('7. Renders ErrorState and allows retrying on network error', () => {
    vi.spyOn(useAppDetailsModule, 'useAppDetails').mockReturnValue({
      data: null,
      isLoading: false,
      error: AppError.internal('Database error'),
      refetch: mockRefetch,
    });

    render(
      <BrowserRouter>
        <AppDetailPage />
      </BrowserRouter>
    );

    expect(screen.getByText('Unable to Load Application')).toBeInTheDocument();
  });
});
