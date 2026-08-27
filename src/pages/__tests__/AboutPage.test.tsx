import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AboutPage } from '../AboutPage';
import * as useAppsModule from '@/hooks/useApps';
import * as useUserLibraryModule from '@/hooks/useUserLibrary';
import * as useAuthModule from '@/hooks/useAuth';
import { AppError } from '@/lib/errors';
import type { App } from '@/types/app.types';

const mockSelectedApps: App[] = [
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

describe('AboutPage Component', () => {
  const mockRefetchApps = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

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
      changePassword: vi.fn(),
      deleteAccount: vi.fn(),
      clearError: vi.fn(),
    });

    vi.spyOn(useAppsModule, 'useFeaturedApps').mockReturnValue({
      apps: mockSelectedApps,
      hasMore: false,
      isLoading: false,
      error: null,
      refetch: mockRefetchApps,
    });
  });

  it('1. Renders Hero profile with name, role, tagline, avatar, and social links', () => {
    render(
      <BrowserRouter>
        <AboutPage />
      </BrowserRouter>
    );

    expect(screen.getByRole('heading', { level: 1, name: 'Sourav' })).toBeInTheDocument();
    expect(screen.getByText(/software engineer & independent builder/i)).toBeInTheDocument();
    expect(screen.getByText(/serious software, built by someone who cares\./i)).toBeInTheDocument();
    expect(screen.getByText('S')).toBeInTheDocument();

    const githubLink = screen.getByRole('link', { name: /connect on github/i });
    expect(githubLink).toHaveAttribute('href', 'https://github.com/elsesourav');
    expect(githubLink).toHaveAttribute('target', '_blank');

    const emailLink = screen.getByRole('link', { name: /connect on email/i });
    expect(emailLink).toHaveAttribute('href', 'mailto:contact@elsesourav.com');
  });

  it('2. Renders Engineering Philosophy and core values', () => {
    render(
      <BrowserRouter>
        <AboutPage />
      </BrowserRouter>
    );

    expect(
      screen.getByRole('heading', { level: 2, name: /engineering philosophy/i })
    ).toBeInTheDocument();
    expect(screen.getByText('Speed & Simplicity')).toBeInTheDocument();
    expect(screen.getByText('Refined Craftsmanship')).toBeInTheDocument();
    expect(screen.getByText('Privacy & Transparency')).toBeInTheDocument();
  });

  it('3. Renders What I Build domains and descriptions', () => {
    render(
      <BrowserRouter>
        <AboutPage />
      </BrowserRouter>
    );

    expect(screen.getByRole('heading', { level: 2, name: /what i build/i })).toBeInTheDocument();
    expect(screen.getByText('Web Applications')).toBeInTheDocument();
    expect(screen.getByText('Browser Extensions')).toBeInTheDocument();
    expect(screen.getByText('Developer Tools')).toBeInTheDocument();
    expect(screen.getByText('Digital Experiments')).toBeInTheDocument();
  });

  it('4. Renders curated technologies without giant logo walls', () => {
    render(
      <BrowserRouter>
        <AboutPage />
      </BrowserRouter>
    );

    expect(
      screen.getByRole('heading', { level: 2, name: /technologies & tools/i })
    ).toBeInTheDocument();
    expect(screen.getByText('Frontend & UI')).toBeInTheDocument();
    expect(screen.getByText('React 19')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.getByText('Cloud & Data')).toBeInTheDocument();
    expect(screen.getByText('Cloud Firestore')).toBeInTheDocument();
  });

  it('5. Renders selected work using real published apps with AppCard', () => {
    render(
      <BrowserRouter>
        <AboutPage />
      </BrowserRouter>
    );

    expect(screen.getByRole('heading', { level: 2, name: /selected work/i })).toBeInTheDocument();
    expect(screen.getByText('CodeFlow IDE')).toBeInTheDocument();

    const viewAllBtn = screen.getByRole('button', { name: /view all apps/i });
    expect(viewAllBtn).toBeInTheDocument();
  });

  it('6. Shows skeletons during selected work loading and handles error with retry', () => {
    vi.spyOn(useAppsModule, 'useFeaturedApps').mockReturnValue({
      apps: [],
      hasMore: false,
      isLoading: true,
      error: null,
      refetch: mockRefetchApps,
    });

    const { rerender } = render(
      <BrowserRouter>
        <AboutPage />
      </BrowserRouter>
    );

    expect(screen.getByTestId('about-apps-skeleton')).toBeInTheDocument();

    vi.spyOn(useAppsModule, 'useFeaturedApps').mockReturnValue({
      apps: [],
      hasMore: false,
      isLoading: false,
      error: AppError.internal('Failed to load apps'),
      refetch: mockRefetchApps,
    });

    rerender(
      <BrowserRouter>
        <AboutPage />
      </BrowserRouter>
    );

    expect(screen.getByText('Selected Work Unavailable')).toBeInTheDocument();
    const retryBtn = screen.getByRole('button', { name: /retry/i });
    fireEvent.click(retryBtn);
    expect(mockRefetchApps).toHaveBeenCalled();
  });

  it('7. Renders Current Focus and Contact card with email & support buttons', () => {
    render(
      <BrowserRouter>
        <AboutPage />
      </BrowserRouter>
    );

    expect(screen.getByRole('heading', { level: 2, name: /current focus/i })).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: /let’s build something meaningful\./i })
    ).toBeInTheDocument();

    const emailBtn = screen.getByRole('button', { name: /email sourav/i });
    expect(emailBtn).toBeInTheDocument();

    const supportLink = screen.getByRole('link', { name: /visit support and feedback center/i });
    expect(supportLink).toHaveAttribute('href', '/support');
  });

  it('8. Sets document title and injects JSON-LD Person structured data', () => {
    render(
      <BrowserRouter>
        <AboutPage />
      </BrowserRouter>
    );

    expect(document.title).toContain('About Sourav - Creator & Developer | ElseSourav');
    const jsonLd = document.getElementById('json-ld-about-person');
    expect(jsonLd).not.toBeNull();
    expect(jsonLd?.textContent).toContain('Sourav');
  });
});
