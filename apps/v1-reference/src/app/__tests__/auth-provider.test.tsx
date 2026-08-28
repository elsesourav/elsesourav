import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider } from '../auth-provider';
import { useAuth } from '@/hooks/useAuth';
import { authService } from '@/services/auth.service';
import { ok, err } from '@/lib/result';
import { AppError } from '@/lib/errors';
import type { AuthUser } from '@/types/auth.types';

vi.mock('@/firebase', () => ({
  isFirebaseConfigured: vi.fn().mockReturnValue(true),
  getFirebaseAuth: vi.fn(),
  getFirebaseFirestore: vi.fn(),
}));

const TestConsumer: React.FC = () => {
  const { authUser, user, isLoading, isAuthenticated, isAdmin, signIn, signOut, error } = useAuth();

  return (
    <div>
      <div data-testid="loading-status">{isLoading ? 'Loading' : 'Ready'}</div>
      <div data-testid="auth-status">{isAuthenticated ? 'Authenticated' : 'Unauthenticated'}</div>
      <div data-testid="admin-status">{isAdmin ? 'Admin' : 'Regular'}</div>
      <div data-testid="user-email">{authUser?.email || 'No email'}</div>
      <div data-testid="user-role">{user?.role || 'No role'}</div>
      {error && <div data-testid="auth-error">{error.message}</div>}

      <button
        type="button"
        onClick={() => signIn({ email: 'dev@elsesourav.com', password: 'password123' })}
      >
        Sign In
      </button>

      <button type="button" onClick={() => signOut()}>
        Sign Out
      </button>
    </div>
  );
};

describe('AuthProvider & useAuth', () => {
  const mockAuthUser: AuthUser = {
    uid: 'user-abc-123',
    email: 'admin@elsesourav.com',
    emailVerified: true,
    displayName: 'Sourav Admin',
    photoURL: null,
    isAnonymous: false,
    providerId: 'password',
    createdAt: Date.now(),
    lastLoginAt: Date.now(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('manages initial loading state and reflects unauthenticated session', async () => {
    let authStateCallback: ((u: AuthUser | null) => void) | undefined;
    vi.spyOn(authService, 'onAuthStateChanged').mockImplementationOnce((cb) => {
      authStateCallback = cb;
      return vi.fn();
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    expect(screen.getByTestId('loading-status')).toHaveTextContent('Loading');

    // Simulate Firebase restoring state as unauthenticated
    act(() => {
      authStateCallback!(null);
    });

    expect(screen.getByTestId('loading-status')).toHaveTextContent('Ready');
    expect(screen.getByTestId('auth-status')).toHaveTextContent('Unauthenticated');
  });

  it('updates state when session is restored as authenticated user', async () => {
    let authStateCallback: ((u: AuthUser | null) => void) | undefined;
    vi.spyOn(authService, 'onAuthStateChanged').mockImplementationOnce((cb) => {
      authStateCallback = cb;
      return vi.fn();
    });

    render(
      <AuthProvider defaultRole="admin">
        <TestConsumer />
      </AuthProvider>
    );

    act(() => {
      authStateCallback!(mockAuthUser);
    });

    expect(screen.getByTestId('loading-status')).toHaveTextContent('Ready');
    expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
    expect(screen.getByTestId('admin-status')).toHaveTextContent('Admin');
    expect(screen.getByTestId('user-email')).toHaveTextContent('admin@elsesourav.com');
  });

  it('handles sign in action and captures errors', async () => {
    const user = userEvent.setup();
    vi.spyOn(authService, 'onAuthStateChanged').mockReturnValue(vi.fn());
    vi.spyOn(authService, 'signIn').mockResolvedValueOnce(
      err(AppError.unauthorized('Invalid email or password.'))
    );

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    const signInBtn = screen.getByRole('button', { name: /sign in/i });
    await user.click(signInBtn);

    expect(screen.getByTestId('auth-error')).toHaveTextContent(/invalid email or password/i);
  });

  it('handles successful sign out action', async () => {
    const user = userEvent.setup();
    vi.spyOn(authService, 'onAuthStateChanged').mockImplementationOnce((cb) => {
      cb(mockAuthUser);
      return vi.fn();
    });
    vi.spyOn(authService, 'signOut').mockResolvedValueOnce(ok(undefined));

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');

    const signOutBtn = screen.getByRole('button', { name: /sign out/i });
    await user.click(signOutBtn);

    expect(screen.getByTestId('auth-status')).toHaveTextContent('Unauthenticated');
  });
});
