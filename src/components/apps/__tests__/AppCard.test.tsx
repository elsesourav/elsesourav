import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AppCard } from '../AppCard';
import type { App } from '@/types/app.types';
import * as useAuthModule from '@/hooks/useAuth';
import * as useUserLibraryModule from '@/hooks/useUserLibrary';
import { analyticsService } from '@/services/analytics.service';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockApp: App = {
  id: 'app-flow',
  slug: 'code-flow',
  name: 'CodeFlow IDE',
  shortDescription: 'Modern web development environment in the browser.',
  description: 'Full featured cloud IDE built by ElseSourav.',
  iconUrl: 'https://cdn.elsesourav.com/icon.png',
  primaryCategory: 'developer-tools',
  tags: ['ide', 'editor', 'code'],
  status: 'published',
  platforms: ['web'],
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
  stats: { views: 100, launches: 50, libraryAdds: 10, ratingAverage: 4.9 },
  isFeatured: true,
  isPinned: false,
  sortOrder: 1,
  createdAt: 1700000000000,
  updatedAt: 1700000000000,
};

describe('AppCard Component & Smart Action System', () => {
  const mockToggleSave = vi.fn();
  const mockIsSaved = vi.fn().mockReturnValue(false);

  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(analyticsService, 'trackPrimaryAction').mockResolvedValue(undefined);

    vi.spyOn(useUserLibraryModule, 'useUserLibrary').mockReturnValue({
      savedAppIds: new Set(),
      isSaved: mockIsSaved,
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
  });

  it('1. Renders default card with name, description, category, and rating', () => {
    render(
      <BrowserRouter>
        <AppCard app={mockApp} />
      </BrowserRouter>
    );

    expect(screen.getByText('CodeFlow IDE')).toBeInTheDocument();
    expect(
      screen.getByText('Modern web development environment in the browser.')
    ).toBeInTheDocument();
    expect(screen.getByText('developer tools')).toBeInTheDocument();
    expect(screen.getByText('4.9')).toBeInTheDocument();
    expect(screen.getByText('Featured')).toBeInTheDocument();
    expect(screen.getByText('Open App')).toBeInTheDocument();
  });

  it('2. Renders compact variant hiding description and tags', () => {
    render(
      <BrowserRouter>
        <AppCard app={mockApp} variant="compact" />
      </BrowserRouter>
    );

    expect(screen.getByText('CodeFlow IDE')).toBeInTheDocument();
    expect(screen.getByText('Open App')).toBeInTheDocument();
  });

  it('3. Renders unavailable variant with Unavailable badge and disabled state', () => {
    render(
      <BrowserRouter>
        <AppCard app={mockApp} isUnavailable={true} />
      </BrowserRouter>
    );

    expect(screen.getByText('Unavailable')).toBeInTheDocument();
    expect(screen.getByText('View Archived')).toBeInTheDocument();
  });

  it('4. Navigates to app detail on whole card click', () => {
    render(
      <BrowserRouter>
        <AppCard app={mockApp} />
      </BrowserRouter>
    );

    const card = screen.getByRole('button', { name: /view codeflow ide application/i });
    fireEvent.click(card);

    expect(mockNavigate).toHaveBeenCalledWith('/apps/code-flow');
  });

  it('5. Supports keyboard navigation via Enter key', () => {
    render(
      <BrowserRouter>
        <AppCard app={mockApp} />
      </BrowserRouter>
    );

    const card = screen.getByRole('button', { name: /view codeflow ide application/i });
    fireEvent.keyDown(card, { key: 'Enter', code: 'Enter' });

    expect(mockNavigate).toHaveBeenCalledWith('/apps/code-flow');
  });

  it('6. Redirects anonymous user to login on bookmark click', () => {
    render(
      <BrowserRouter>
        <AppCard app={mockApp} />
      </BrowserRouter>
    );

    const bookmarkBtn = screen.getByLabelText(/save codeflow ide to library/i);
    fireEvent.click(bookmarkBtn);

    expect(mockNavigate).toHaveBeenCalledWith('/login');
    expect(mockToggleSave).not.toHaveBeenCalled();
  });

  it('7. Toggles bookmark state for authenticated user without card navigation', async () => {
    vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
      authUser: {
        uid: 'u1',
        email: 'user@example.com',
        emailVerified: true,
        displayName: 'Test',
        photoURL: null,
        isAnonymous: false,
        providerId: 'password',
      },
      user: {
        id: 'u1',
        email: 'user@example.com',
        displayName: 'Test',
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
      <BrowserRouter>
        <AppCard app={mockApp} />
      </BrowserRouter>
    );

    const bookmarkBtn = screen.getByLabelText(/save codeflow ide to library/i);
    fireEvent.click(bookmarkBtn);

    expect(mockToggleSave).toHaveBeenCalledWith('app-flow');
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('8. Opens external link with safe target and triggers non-blocking telemetry', () => {
    const windowOpenSpy = vi.spyOn(window, 'open').mockImplementation(() => null);

    render(
      <BrowserRouter>
        <AppCard app={mockApp} />
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
});
