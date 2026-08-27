import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AppRoutes } from '@/routes/AppRoutes';
import { ThemeProvider } from '@/app/theme';
import { AuthContext } from '@/app/auth-context';
import { ToastProvider } from '@/components';
import type { AuthContextValue, AuthUser } from '@/types/auth.types';
import type { User } from '@/types/user.types';

// Mock Firebase client
vi.mock('@/firebase', () => ({
  isFirebaseConfigured: vi.fn().mockReturnValue(true),
  getFirebaseAuth: vi.fn(),
  getFirebaseFirestore: vi.fn(),
}));

describe('Global Application Shell, Routing & Navigation', () => {
  const mockRegularUser: User = {
    id: 'user-1',
    email: 'user@elsesourav.com',
    displayName: 'Sourav Tester',
    role: 'user',
    status: 'active',
    preferences: {
      theme: 'dark',
      emailNotifications: true,
      reduceMotion: false,
      compactView: false,
    },
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const mockAdminUser: User = {
    ...mockRegularUser,
    id: 'admin-1',
    email: 'admin@elsesourav.com',
    role: 'admin',
  };

  const mockAuthUser: AuthUser = {
    uid: 'user-1',
    email: 'user@elsesourav.com',
    emailVerified: true,
    displayName: 'Sourav Tester',
    photoURL: null,
    isAnonymous: false,
    providerId: 'password',
    createdAt: Date.now(),
    lastLoginAt: Date.now(),
  };

  const createAuthContextValue = (overrides?: Partial<AuthContextValue>): AuthContextValue => ({
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
    signOut: vi.fn().mockResolvedValue({ success: true, data: undefined }),
    sendPasswordReset: vi.fn(),
    sendVerificationEmail: vi.fn(),
    clearError: vi.fn(),
    ...overrides,
  });

  const renderWithProviders = (
    initialPath = '/',
    authContextOverrides?: Partial<AuthContextValue>
  ) => {
    const authValue = createAuthContextValue(authContextOverrides);

    return render(
      <ThemeProvider>
        <AuthContext.Provider value={authValue}>
          <ToastProvider>
            <MemoryRouter initialEntries={[initialPath]}>
              <AppRoutes />
            </MemoryRouter>
          </ToastProvider>
        </AuthContext.Provider>
      </ThemeProvider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Public Routes & Navigation', () => {
    it('renders Header, Home page, and Footer on initial load', () => {
      renderWithProviders('/');

      expect(screen.getByLabelText('ElseSourav Home')).toBeInTheDocument();
      expect(
        screen.getByRole('heading', {
          level: 1,
          name: /serious software, built by someone who cares/i,
        })
      ).toBeInTheDocument();
      expect(screen.getByText(/All rights reserved/i)).toBeInTheDocument();
    });

    it('renders Apps page when navigating to /apps', () => {
      renderWithProviders('/apps');
      expect(
        screen.getByRole('heading', { level: 1, name: /Explore Applications/i })
      ).toBeInTheDocument();
    });

    it('renders Categories page when navigating to /categories', () => {
      renderWithProviders('/categories');
      expect(
        screen.getByRole('heading', { level: 1, name: /Software Categories/i })
      ).toBeInTheDocument();
    });

    it('renders Blog page when navigating to /blog', () => {
      renderWithProviders('/blog');
      expect(
        screen.getByRole('heading', { level: 1, name: /Engineering Notes & Articles|Blog/i })
      ).toBeInTheDocument();
    });

    it('renders 404 NotFound page for invalid route paths', () => {
      renderWithProviders('/non-existent-random-route');
      expect(screen.getByText(/Page Not Found \(404\)/i)).toBeInTheDocument();
    });
  });

  describe('Search Dialog Modal', () => {
    it('opens search dialog when clicking header search button and filters items', async () => {
      const user = userEvent.setup();
      renderWithProviders('/');

      const searchBtn = screen.getByLabelText(/Search apps, tools, and documentation/i);
      await user.click(searchBtn);

      const dialog = screen.getByRole('dialog', { name: /Search ElseSourav/i });
      expect(dialog).toBeInTheDocument();

      const searchInput = screen.getByPlaceholderText(/Search apps, tools, categories, articles/i);
      await user.type(searchInput, 'Extension');

      expect(within(dialog).getByText('Browser Extensions')).toBeInTheDocument();
    });
  });

  describe('Authentication State in Header', () => {
    it('displays Sign In button when unauthenticated', () => {
      renderWithProviders('/', { isAuthenticated: false });
      expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
    });

    it('displays user avatar and menu trigger when authenticated', () => {
      renderWithProviders('/', {
        isAuthenticated: true,
        authUser: mockAuthUser,
        user: mockRegularUser,
      });

      expect(screen.getByLabelText(/Open user account menu/i)).toBeInTheDocument();
      expect(screen.getByText('Sourav Tester')).toBeInTheDocument();
    });
  });

  describe('Route Guards: ProtectedRoute & AdminRoute', () => {
    it('redirects unauthenticated user from /library to /login', () => {
      renderWithProviders('/library', { isAuthenticated: false });
      expect(
        screen.getByRole('heading', { level: 1, name: /Sign In to Your Account/i })
      ).toBeInTheDocument();
    });

    it('allows authenticated user to view /library', () => {
      renderWithProviders('/library', {
        isAuthenticated: true,
        authUser: mockAuthUser,
        user: mockRegularUser,
      });

      expect(
        screen.getByRole('heading', { level: 1, name: /My Software Library/i })
      ).toBeInTheDocument();
    });

    it('blocks regular user from /admin and displays 403 error state', () => {
      renderWithProviders('/admin', {
        isAuthenticated: true,
        isAdmin: false,
        authUser: mockAuthUser,
        user: mockRegularUser,
      });

      expect(screen.getByText(/Admin Access Required/i)).toBeInTheDocument();
    });

    it('allows admin user to access /admin portal', () => {
      renderWithProviders('/admin', {
        isAuthenticated: true,
        isAdmin: true,
        authUser: { ...mockAuthUser, uid: 'admin-1' },
        user: mockAdminUser,
      });

      expect(
        screen.getByRole('heading', { level: 1, name: /Admin Dashboard/i })
      ).toBeInTheDocument();
    });
  });

  describe('Mobile Drawer', () => {
    it('toggles mobile drawer on menu toggle button click', async () => {
      const user = userEvent.setup();
      renderWithProviders('/');

      const toggleBtn = screen.getByLabelText(/Open mobile menu/i);
      await user.click(toggleBtn);

      expect(screen.getByRole('dialog', { name: /Navigation Menu/i })).toBeInTheDocument();
    });
  });
});
