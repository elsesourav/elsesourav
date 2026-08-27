import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { LibraryPage } from '../LibraryPage';
import { AuthContext } from '@/app/auth-context';
import * as useUserLibraryModule from '@/hooks/useUserLibrary';
import * as useNotificationsModule from '@/hooks/useNotifications';
import { supportService } from '@/services/support.service';
import type { AuthContextValue, AuthUser } from '@/types/auth.types';
import type { User } from '@/types/user.types';
import type { App } from '@/types/app.types';
import type { EnrichedLibraryItem } from '@/services/library.service';
import type { SupportTicket } from '@/types/support.types';
import { ok, err } from '@/lib/result';
import { AppError } from '@/lib/errors';
import { ROUTES } from '@/constants/routes';

describe('LibraryPage Component (Prompt 44)', () => {
  const mockSignOut = vi.fn();
  const mockRemoveApp = vi.fn();
  const mockRefreshLibrary = vi.fn();
  const mockMarkAsRead = vi.fn();

  const mockUser: User = {
    id: 'user-100',
    email: 'sourav@example.com',
    displayName: 'Sourav Mukherjee',
    role: 'user',
    status: 'active',
    preferences: {
      theme: 'dark',
      emailNotifications: true,
      reduceMotion: false,
      compactView: false,
    },
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
  };

  const mockAuthUser: AuthUser = {
    uid: 'user-100',
    email: 'sourav@example.com',
    emailVerified: true,
    displayName: 'Sourav Mukherjee',
    photoURL: null,
    isAnonymous: false,
    providerId: 'password',
    createdAt: 1700000000000,
  };

  const mockApp: App = {
    id: 'app-flow',
    slug: 'codeflow-ide',
    name: 'CodeFlow IDE',
    shortDescription: 'Modern cloud editor',
    description: 'Next-gen web IDE for high performance engineering.',
    primaryCategory: 'developer-tools',
    tags: ['ide', 'editor'],
    iconUrl: 'https://example.com/icon.png',
    status: 'published',
    isFeatured: true,
    isPinned: false,
    sortOrder: 1,
    platforms: ['web'],
    screenshots: [],
    links: [
      {
        id: 'link-1',
        appId: 'app-flow',
        platform: 'web',
        url: 'https://codeflow.dev',
        label: 'Open Web App',
        displayOrder: 1,
        isPrimary: true,
        isActive: true,
      },
    ],
    stats: {
      views: 100,
      launches: 50,
      libraryAdds: 20,
      ratingAverage: 4.8,
      ratingCount: 10,
    },
    currentVersion: '1.2.0',
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
  };

  const mockLibraryItems: EnrichedLibraryItem[] = [
    {
      libraryItem: {
        id: 'lib-1',
        userId: 'user-100',
        appId: 'app-flow',
        isFavorite: true,
        isPinned: false,
        addedAt: 1700000000000,
      },
      app: mockApp,
      isUnavailable: false,
    },
    {
      libraryItem: {
        id: 'lib-2',
        userId: 'user-100',
        appId: 'app-archived',
        isFavorite: false,
        isPinned: false,
        addedAt: 1700000000000,
      },
      app: null,
      isUnavailable: true,
    },
  ];

  const mockTickets: SupportTicket[] = [
    {
      id: 'ticket-100',
      userId: 'user-100',
      subject: 'Issue connecting to terminal runner',
      description: 'The websocket terminal disconnects frequently.',
      category: 'bug_report',
      priority: 'normal',
      status: 'in_progress',
      ticketNumber: 'ES-100',
      lastMessageAt: 1700000000000,
      createdAt: 1700000000000,
      updatedAt: 1700000000000,
    },
  ];

  const createAuthContextValue = (overrides?: Partial<AuthContextValue>): AuthContextValue => ({
    authUser: mockAuthUser,
    user: mockUser,
    role: 'user',
    isAuthenticated: true,
    isAdmin: false,
    isLoading: false,
    error: null,
    signIn: vi.fn(),
    signUp: vi.fn(),
    signInWithGoogle: vi.fn(),
    signOut: mockSignOut,
    sendPasswordReset: vi.fn(),
    sendVerificationEmail: vi.fn(),
    changePassword: vi.fn(),
    deleteAccount: vi.fn(),
    clearError: vi.fn(),
    ...overrides,
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockSignOut.mockResolvedValue(ok(undefined));

    vi.spyOn(useUserLibraryModule, 'useUserLibrary').mockReturnValue({
      savedAppIds: new Set(['app-flow', 'app-archived']),
      isSaved: (id) => id === 'app-flow' || id === 'app-archived',
      saveApp: vi.fn(),
      removeApp: mockRemoveApp,
      toggleSave: vi.fn(),
      libraryItems: mockLibraryItems,
      libraryCount: 2,
      isLoading: false,
      refreshLibrary: mockRefreshLibrary,
    });

    vi.spyOn(useNotificationsModule, 'useNotifications').mockReturnValue({
      notifications: [
        {
          id: 'notif-1',
          userId: 'user-100',
          type: 'APP_UPDATE',
          title: 'CodeFlow IDE v1.3 Released',
          message: 'Real-time debugger is live.',
          link: '/apps/codeflow-ide',
          read: false,
          isRead: false,
          createdAt: 1700000000000,
          updatedAt: 1700000000000,
        },
      ],
      unreadCount: 1,
      isLoading: false,
      error: null,
      markAsRead: mockMarkAsRead,
      markAllAsRead: vi.fn(),
      refetch: vi.fn(),
    });

    vi.spyOn(supportService, 'listUserTickets').mockResolvedValue(
      ok({ items: mockTickets, hasMore: false })
    );
  });

  const renderLibraryPage = (authOverrides?: Partial<AuthContextValue>) => {
    const authValue = createAuthContextValue(authOverrides);

    return render(
      <AuthContext.Provider value={authValue}>
        <MemoryRouter initialEntries={[ROUTES.LIBRARY]}>
          <Routes>
            <Route path={ROUTES.LIBRARY} element={<LibraryPage />} />
            <Route path={ROUTES.SETTINGS} element={<div>Mock Settings</div>} />
            <Route path={ROUTES.APPS} element={<div>Mock Apps Catalog</div>} />
            <Route path={ROUTES.HOME} element={<div>Mock Home Landing</div>} />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    );
  };

  it('1. Renders authenticated welcome header with avatar, name, verification badge, and stats', async () => {
    renderLibraryPage();

    expect(
      screen.getByRole('heading', { level: 1, name: /My Software Library/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/Welcome back, Sourav Mukherjee/i)).toBeInTheDocument();
    expect(screen.getByText(/sourav@example.com/i)).toBeInTheDocument();
    expect(screen.getByText(/Verified/i)).toBeInTheDocument();

    // Stats cards
    expect(screen.getByText('Saved Applications')).toBeInTheDocument();
    expect(screen.getByText('Open Support Tickets')).toBeInTheDocument();
    expect(screen.getByText('Unread Notifications')).toBeInTheDocument();
  });

  it('2. Renders saved apps and archived software cards correctly', async () => {
    renderLibraryPage();

    // Saved App
    expect(screen.getByText('CodeFlow IDE')).toBeInTheDocument();
    expect(screen.getByText('Modern cloud editor')).toBeInTheDocument();

    // Archived Saved App
    expect(screen.getByText('Archived Software')).toBeInTheDocument();
    expect(
      screen.getByText(/currently archived or no longer publicly listed/i)
    ).toBeInTheDocument();

    // Remove bookmark action on archived card
    const removeBtn = screen.getByRole('button', { name: /Remove archived app from library/i });
    await userEvent.click(removeBtn);
    expect(mockRemoveApp).toHaveBeenCalledWith('app-archived');
  });

  it('3. Renders onboarding empty state when library is empty', () => {
    vi.spyOn(useUserLibraryModule, 'useUserLibrary').mockReturnValue({
      savedAppIds: new Set(),
      isSaved: () => false,
      saveApp: vi.fn(),
      removeApp: mockRemoveApp,
      toggleSave: vi.fn(),
      libraryItems: [],
      libraryCount: 0,
      isLoading: false,
      refreshLibrary: mockRefreshLibrary,
    });

    renderLibraryPage();

    expect(screen.getByText(/Save apps you want to come back to/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Explore Software Catalog/i })).toBeInTheDocument();
  });

  it('4. Renders support ticket summary widget with status badges', async () => {
    renderLibraryPage();

    expect(
      screen.getByRole('heading', { level: 3, name: /Support & Tickets/i })
    ).toBeInTheDocument();
    expect(await screen.findByText('Issue connecting to terminal runner')).toBeInTheDocument();
    expect(screen.getByText('In Progress')).toBeInTheDocument();
  });

  it('5. Renders notifications summary widget and handles click', async () => {
    renderLibraryPage();

    expect(screen.getByRole('heading', { level: 3, name: /Recent Alerts/i })).toBeInTheDocument();
    expect(screen.getByText('CodeFlow IDE v1.3 Released')).toBeInTheDocument();

    const notifBtn = screen.getByText('CodeFlow IDE v1.3 Released').closest('button');
    if (notifBtn) {
      await userEvent.click(notifBtn);
      expect(mockMarkAsRead).toHaveBeenCalledWith('notif-1');
    }
  });

  it('6. Handles sign out action from dashboard header', async () => {
    renderLibraryPage();

    const signOutBtn = screen.getByRole('button', { name: /Sign Out/i });
    await userEvent.click(signOutBtn);

    expect(mockSignOut).toHaveBeenCalled();
    await waitFor(() => {
      expect(screen.getByText('Mock Home Landing')).toBeInTheDocument();
    });
  });

  it('7. Isolates errors so support failure does not break saved apps', async () => {
    vi.spyOn(supportService, 'listUserTickets').mockResolvedValue(
      err(AppError.internal('Support service unreachable'))
    );

    renderLibraryPage();

    // Support section shows localized error
    expect(await screen.findByText(/Could not load ticket summary/i)).toBeInTheDocument();

    // Saved apps still render properly
    expect(screen.getByText('CodeFlow IDE')).toBeInTheDocument();
  });

  it('8. Renders loading skeletons when authentication session is loading', () => {
    renderLibraryPage({ isLoading: true });

    expect(screen.getByRole('main', { busy: true })).toBeInTheDocument();
  });
});
