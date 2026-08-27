import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { LoginPage } from '../LoginPage';
import { AuthContext } from '@/app/auth-context';
import type { AuthContextValue, AuthUser } from '@/types/auth.types';
import { ok, err } from '@/lib/result';
import { AppError } from '@/lib/errors';
import { ROUTES } from '@/constants/routes';

describe('LoginPage Component', () => {
  const mockSignIn = vi.fn();

  const createAuthContextValue = (overrides?: Partial<AuthContextValue>): AuthContextValue => ({
    authUser: null,
    user: null,
    role: 'user',
    isAuthenticated: false,
    isAdmin: false,
    isLoading: false,
    error: null,
    signIn: mockSignIn,
    signUp: vi.fn(),
    signInWithGoogle: vi.fn(),
    signOut: vi.fn(),
    sendPasswordReset: vi.fn(),
    sendVerificationEmail: vi.fn(),
    clearError: vi.fn(),
    ...overrides,
  });

  const renderLoginPage = (
    initialEntry: string = ROUTES.LOGIN,
    authOverrides?: Partial<AuthContextValue>
  ) => {
    const authValue = createAuthContextValue(authOverrides);

    return render(
      <AuthContext.Provider value={authValue}>
        <MemoryRouter initialEntries={[initialEntry]}>
          <Routes>
            <Route path={ROUTES.LOGIN} element={<LoginPage />} />
            <Route path={ROUTES.LIBRARY} element={<div>Mock Library Page</div>} />
            <Route path={ROUTES.SUPPORT_TICKETS} element={<div>Mock Support Tickets</div>} />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('1. Renders login form fields, labels, buttons, and links', () => {
    renderLoginPage();

    expect(
      screen.getByRole('heading', { level: 1, name: /Sign In to ElseSourav/i })
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Show password/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Sign In$/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Forgot password\?/i })).toHaveAttribute(
      'href',
      ROUTES.FORGOT_PASSWORD
    );
    expect(screen.getByRole('link', { name: /Create an Account/i })).toHaveAttribute(
      'href',
      ROUTES.SIGNUP
    );
  });

  it('2. Shows validation errors when submitting with empty or invalid fields', async () => {
    const user = userEvent.setup();
    renderLoginPage();

    const submitBtn = screen.getByRole('button', { name: /^Sign In$/i });
    await user.click(submitBtn);

    expect(
      await screen.findByText(/Email is required|Please enter a valid email address/i)
    ).toBeInTheDocument();
    expect(mockSignIn).not.toHaveBeenCalled();

    // Type invalid email
    const emailInput = screen.getByLabelText(/Email Address/i);
    await user.type(emailInput, 'invalid-email-string');
    await user.click(submitBtn);

    expect(await screen.findByText(/Please enter a valid email address/i)).toBeInTheDocument();
  });

  it('3. Toggles password visibility when clicking show/hide toggle button', async () => {
    const user = userEvent.setup();
    renderLoginPage();

    const passwordInput = screen.getByLabelText(/^Password/i);
    const toggleBtn = screen.getByRole('button', { name: /Show password/i });

    expect(passwordInput).toHaveAttribute('type', 'password');

    await user.click(toggleBtn);
    expect(passwordInput).toHaveAttribute('type', 'text');
    expect(screen.getByRole('button', { name: /Hide password/i })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Hide password/i }));
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('4. Successfully signs in and redirects to default safe path (/library)', async () => {
    const user = userEvent.setup();
    const mockAuthUser: AuthUser = {
      uid: 'user-123',
      email: 'user@example.com',
      emailVerified: true,
      displayName: 'Alice User',
      photoURL: null,
      isAnonymous: false,
      providerId: 'password',
    };

    mockSignIn.mockResolvedValueOnce(ok(mockAuthUser));

    renderLoginPage();

    await user.type(screen.getByLabelText(/Email Address/i), 'user@example.com');
    await user.type(screen.getByLabelText(/^Password/i), 'SecretPass123');
    await user.click(screen.getByRole('button', { name: /^Sign In$/i }));

    expect(mockSignIn).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'SecretPass123',
    });

    await waitFor(() => {
      expect(screen.getByText('Mock Library Page')).toBeInTheDocument();
    });
  });

  it('5. Successfully signs in with safe redirect query parameter (?redirect=/support/tickets)', async () => {
    const user = userEvent.setup();
    const mockAuthUser: AuthUser = {
      uid: 'user-123',
      email: 'user@example.com',
      emailVerified: true,
      displayName: 'Alice User',
      photoURL: null,
      isAnonymous: false,
      providerId: 'password',
    };

    mockSignIn.mockResolvedValueOnce(ok(mockAuthUser));

    renderLoginPage(`${ROUTES.LOGIN}?redirect=${encodeURIComponent(ROUTES.SUPPORT_TICKETS)}`);

    await user.type(screen.getByLabelText(/Email Address/i), 'user@example.com');
    await user.type(screen.getByLabelText(/^Password/i), 'SecretPass123');
    await user.click(screen.getByRole('button', { name: /^Sign In$/i }));

    await waitFor(() => {
      expect(screen.getByText('Mock Support Tickets')).toBeInTheDocument();
    });
  });

  it('6. Sanitizes malicious redirect query parameter (?redirect=https://evil.com) and falls back to /library', async () => {
    const user = userEvent.setup();
    const mockAuthUser: AuthUser = {
      uid: 'user-123',
      email: 'user@example.com',
      emailVerified: true,
      displayName: 'Alice User',
      photoURL: null,
      isAnonymous: false,
      providerId: 'password',
    };

    mockSignIn.mockResolvedValueOnce(ok(mockAuthUser));

    renderLoginPage(`${ROUTES.LOGIN}?redirect=${encodeURIComponent('https://evil.com/phishing')}`);

    await user.type(screen.getByLabelText(/Email Address/i), 'user@example.com');
    await user.type(screen.getByLabelText(/^Password/i), 'SecretPass123');
    await user.click(screen.getByRole('button', { name: /^Sign In$/i }));

    await waitFor(() => {
      expect(screen.getByText('Mock Library Page')).toBeInTheDocument();
    });
  });

  it('7. Displays user-friendly error alert when authentication fails', async () => {
    const user = userEvent.setup();
    mockSignIn.mockResolvedValueOnce(
      err(AppError.unauthorized('Invalid email or password. Please verify your credentials.'))
    );

    renderLoginPage();

    await user.type(screen.getByLabelText(/Email Address/i), 'user@example.com');
    await user.type(screen.getByLabelText(/^Password/i), 'WrongPassword');
    await user.click(screen.getByRole('button', { name: /^Sign In$/i }));

    expect(
      await screen.findByText(/Invalid email or password. Please verify your credentials./i)
    ).toBeInTheDocument();
  });

  it('8. Automatically redirects already authenticated users', async () => {
    renderLoginPage(ROUTES.LOGIN, {
      isAuthenticated: true,
      isLoading: false,
      authUser: {
        uid: 'user-123',
        email: 'user@example.com',
        emailVerified: true,
        displayName: 'Alice',
        photoURL: null,
        isAnonymous: false,
        providerId: 'password',
      },
    });

    await waitFor(() => {
      expect(screen.getByText('Mock Library Page')).toBeInTheDocument();
    });
  });
});
