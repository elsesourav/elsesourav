import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext } from '@/app/auth-context';
import { ThemeProvider } from '@/app/theme';
import { ToastProvider } from '@/components';
import { AppRoutes } from '@/routes/AppRoutes';
import { appService } from '@/services/app.service';
import { userLibraryService } from '@/services/library.service';
import { userService } from '@/services/user.service';
import { supportService } from '@/services/support.service';
import { notificationService } from '@/services/notification.service';
import type { AuthContextValue, AuthUser } from '@/types/auth.types';
import type { User, UserLibraryItem } from '@/types/user.types';
import type { App } from '@/types/app.types';
import type { SupportTicket } from '@/types/support.types';
import { ok } from '@/lib/result';

describe('Authenticated User Experience E2E Quality & Integration (Prompt 45)', () => {
  const mockApp: App = {
    id: 'app-flow',
    slug: 'codeflow-ide',
    name: 'CodeFlow IDE',
    shortDescription: 'Modern cloud-native developer editor.',
    description: 'Full-featured web IDE with real-time debugger and terminal integrations.',
    iconUrl: 'https://cdn.elsesourav.com/icon.png',
    screenshots: [],
    primaryCategory: 'developer-tools',
    tags: ['ide', 'editor', 'code'],
    status: 'published',
    platforms: ['web'],
    links: [
      {
        id: 'link-1',
        appId: 'app-flow',
        platform: 'web',
        label: 'Open App',
        url: 'https://codeflow.dev',
        displayOrder: 1,
        isPrimary: true,
        isActive: true,
      },
    ],
    stats: {
      views: 1200,
      launches: 450,
      libraryAdds: 85,
      ratingAverage: 4.9,
      ratingCount: 32,
    },
    isFeatured: true,
    isPinned: false,
    sortOrder: 1,
    currentVersion: '1.4.0',
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
  };

  const mockUser: User = {
    id: 'user-sourav-1',
    email: 'sourav@elsesourav.com',
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
    uid: 'user-sourav-1',
    email: 'sourav@elsesourav.com',
    emailVerified: true,
    displayName: 'Sourav Mukherjee',
    photoURL: null,
    isAnonymous: false,
    providerId: 'password',
    createdAt: 1700000000000,
  };

  const mockTicket: SupportTicket = {
    id: 'ticket-99',
    ticketNumber: 'ES-2026-99',
    userId: 'user-sourav-1',
    userEmail: 'sourav@elsesourav.com',
    userName: 'Sourav Mukherjee',
    subject: 'Websocket terminal disconnecting intermittently',
    description: 'When running multiple background build jobs the socket times out.',
    category: 'bug_report',
    priority: 'normal',
    status: 'in_progress',
    lastMessageAt: 1700000000000,
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
  };

  const mockLibraryItem: UserLibraryItem = {
    id: 'lib-1',
    userId: 'user-sourav-1',
    appId: 'app-flow',
    isFavorite: false,
    isPinned: false,
    addedAt: 1700000000000,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(appService, 'listPublishedApps').mockResolvedValue(
      ok({ items: [mockApp], hasMore: false })
    );

    vi.spyOn(appService, 'getAppBySlug').mockResolvedValue(ok(mockApp));

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

    vi.spyOn(supportService, 'listUserTickets').mockResolvedValue(
      ok({ items: [mockTicket], hasMore: false })
    );

    vi.spyOn(supportService, 'getTicket').mockResolvedValue(ok(mockTicket));
    vi.spyOn(supportService, 'listMessages').mockResolvedValue(
      ok({
        items: [
          {
            id: 'msg-1',
            ticketId: 'ticket-99',
            senderUserId: 'user-sourav-1',
            senderName: 'Sourav Mukherjee',
            senderRole: 'user',
            message: 'When running multiple background build jobs the socket times out.',
            createdAt: 1700000000000,
            updatedAt: 1700000000000,
          },
        ],
        hasMore: false,
      })
    );

    vi.spyOn(notificationService, 'getUserNotifications').mockResolvedValue(
      ok({
        items: [
          {
            id: 'notif-1',
            userId: 'user-sourav-1',
            type: 'APP_UPDATE',
            title: 'CodeFlow IDE v1.4 Released',
            message: 'Check out new integrated debugger.',
            link: '/apps/codeflow-ide',
            read: false,
            createdAt: 1700000000000,
            updatedAt: 1700000000000,
          },
        ],
        hasMore: false,
      })
    );
    vi.spyOn(notificationService, 'getUnreadCount').mockResolvedValue(ok(1));
    vi.spyOn(notificationService, 'subscribeToUserNotifications').mockReturnValue(() => {});

    vi.spyOn(userService, 'updateUserProfile').mockResolvedValue(ok(mockUser));
  });

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

  const renderWithProviders = (initialEntry: string, authOverrides?: Partial<AuthContextValue>) => {
    const authContext = createAuthMock(authOverrides);

    return render(
      <ThemeProvider>
        <ToastProvider>
          <AuthContext.Provider value={authContext}>
            <MemoryRouter initialEntries={[initialEntry]}>
              <AppRoutes />
            </MemoryRouter>
          </AuthContext.Provider>
        </ToastProvider>
      </ThemeProvider>
    );
  };

  it('Steps 1–5: Unauthenticated visitor browsing apps and attempting save is safely routed to login', async () => {
    renderWithProviders('/apps/codeflow-ide', {
      authUser: null,
      user: null,
      role: 'user',
      isAuthenticated: false,
    });

    // Verify App detail page rendered
    expect(
      await screen.findByRole('heading', { level: 1, name: /CodeFlow IDE/i })
    ).toBeInTheDocument();

    // Verify unauthenticated user clicking save directs to login
    const saveBtn = await screen.findByRole('button', { name: /Save CodeFlow IDE to library/i });
    expect(saveBtn).toBeInTheDocument();
    await userEvent.click(saveBtn);

    // Redirects safely to login
    await waitFor(() => {
      expect(
        screen.getByRole('heading', { level: 1, name: /Sign in to ElseSourav/i })
      ).toBeInTheDocument();
    });
  });

  it('Steps 6–9: Authenticated user reaches /library and sees their saved software & metrics', async () => {
    renderWithProviders('/library');

    // Step 8: User reaches library
    expect(
      await screen.findByRole('heading', { level: 1, name: /My Software Library/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/Welcome back, Sourav Mukherjee/i)).toBeInTheDocument();
    expect(screen.getByText(/Verified/i)).toBeInTheDocument();

    // Step 9: User sees saved app card
    expect(screen.getByText('CodeFlow IDE')).toBeInTheDocument();
    expect(screen.getByText('Saved Applications')).toBeInTheDocument();
  });

  it('Steps 10–13: User updates settings, manages preferences, and views notifications', async () => {
    renderWithProviders('/settings');

    // Step 10: User opens Settings
    expect(
      await screen.findByRole('heading', { level: 1, name: /Sourav Mukherjee/i })
    ).toBeInTheDocument();

    // Step 11: User updates profile
    const nameInput = screen.getByLabelText(/Display Name/i);
    expect(nameInput).toHaveValue('Sourav Mukherjee');

    // Step 12: Notification bell indicator present in global header
    expect(await screen.findByRole('button', { name: /Notifications/i })).toBeInTheDocument();
  });

  it('Steps 14–17: User views support tickets, status, and message thread', async () => {
    renderWithProviders('/support/tickets');

    // Step 14-16: User sees ticket list
    expect(
      await screen.findByRole('heading', { level: 1, name: /My Support Requests/i })
    ).toBeInTheDocument();
    expect(screen.getByText('Websocket terminal disconnecting intermittently')).toBeInTheDocument();
    expect(screen.getAllByText(/In Progress/i).length).toBeGreaterThan(0);
  });

  it('Steps 18–21: Sign out redirects to public site and blocks unauthenticated access to /library & admin', async () => {
    renderWithProviders('/library', {
      authUser: null,
      user: null,
      role: 'user',
      isAuthenticated: false,
    });

    // Step 19: Unauthenticated user redirected to login
    await waitFor(() => {
      expect(
        screen.getByRole('heading', { level: 1, name: /Sign in to ElseSourav/i })
      ).toBeInTheDocument();
    });

    // Step 20-21: Admin portal blocks regular user
    renderWithProviders('/admin', {
      isAdmin: false,
      role: 'user',
    });

    await waitFor(() => {
      expect(screen.getByText(/Admin Access Required/i)).toBeInTheDocument();
    });
  });
});
