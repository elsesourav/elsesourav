import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AppRoutes } from '@/routes/AppRoutes';
import { ThemeProvider } from '@/app/theme';
import { AuthContext } from '@/app/auth-context';
import { ToastProvider } from '@/components';
import type { User } from '@/types/user.types';
import type { AuthUser, AuthContextValue } from '@/types/auth.types';
import { ok } from '@/lib/result';

describe('Admin Theme Studio (Prompt 50)', () => {
  const mockAdminUser: User = {
    id: 'admin-1',
    email: 'admin@elsesourav.com',
    displayName: 'Sourav Admin',
    role: 'admin',
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

  const mockAdminAuthUser: AuthUser = {
    uid: 'admin-1',
    email: 'admin@elsesourav.com',
    emailVerified: true,
    displayName: 'Sourav Admin',
    photoURL: null,
    isAnonymous: false,
    providerId: 'password',
    createdAt: 1700000000000,
  };

  const createAuthContextValue = (isAdminUser = true): AuthContextValue => ({
    authUser: mockAdminAuthUser,
    user: mockAdminUser,
    role: isAdminUser ? 'admin' : 'user',
    isAuthenticated: true,
    isAdmin: isAdminUser,
    isLoading: false,
    error: null,
    signIn: vi.fn().mockResolvedValue(ok(mockAdminAuthUser)),
    signUp: vi.fn().mockResolvedValue(ok(mockAdminAuthUser)),
    signInWithGoogle: vi.fn().mockResolvedValue(ok(mockAdminAuthUser)),
    signOut: vi.fn().mockResolvedValue(ok(undefined)),
    sendPasswordReset: vi.fn().mockResolvedValue(ok(undefined)),
    sendVerificationEmail: vi.fn().mockResolvedValue(ok(undefined)),
    changePassword: vi.fn().mockResolvedValue(ok(undefined)),
    deleteAccount: vi.fn().mockResolvedValue(ok(undefined)),
    clearError: vi.fn(),
  });

  const renderWithProviders = (initialRoute = '/admin/theme', isAdminUser = true) => {
    return render(
      <MemoryRouter initialEntries={[initialRoute]}>
        <ThemeProvider>
          <AuthContext.Provider value={createAuthContextValue(isAdminUser)}>
            <ToastProvider>
              <AppRoutes />
            </ToastProvider>
          </AuthContext.Provider>
        </ThemeProvider>
      </MemoryRouter>
    );
  };

  it('1. Renders Theme Studio with theme modes, accent colors, and density controls', async () => {
    renderWithProviders('/admin/theme');

    expect(
      await screen.findByRole('heading', { level: 1, name: /Theme & Design System Studio/i })
    ).toBeInTheDocument();

    expect(screen.getByText('Base Theme Mode')).toBeInTheDocument();
    expect(screen.getByText('Platform Accent Colors')).toBeInTheDocument();
    expect(screen.getByText('Surface Glass & UI Density')).toBeInTheDocument();
  });

  it('2. Switches color appearance and selects accent palette', async () => {
    const user = userEvent.setup();
    renderWithProviders('/admin/theme');

    await screen.findByRole('heading', { level: 1, name: /Theme & Design System Studio/i });

    const lightModeBtn = screen.getByRole('button', { name: /Light Mode/i });
    await user.click(lightModeBtn);
    expect(lightModeBtn).toHaveAttribute('aria-pressed', 'true');

    const emeraldBtn = screen.getByRole('button', { name: /Emerald Green/i });
    await user.click(emeraldBtn);
  });

  it('3. Applies and saves theme preset tokens', async () => {
    const user = userEvent.setup();
    renderWithProviders('/admin/theme');

    await screen.findByRole('heading', { level: 1, name: /Theme & Design System Studio/i });

    const saveBtn = screen.getByRole('button', { name: /Apply & Save Presets/i });
    await user.click(saveBtn);

    expect(await screen.findByText(/Theme Presets Applied/i)).toBeInTheDocument();
  });
});
