import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { SignUpPage } from '../SignUpPage';
import { AuthContext } from '@/app/auth-context';
import type { AuthContextValue, AuthUser } from '@/types/auth.types';
import { ok, err } from '@/lib/result';
import { AppError } from '@/lib/errors';
import { ROUTES } from '@/constants/routes';

describe('SignUpPage Component', () => {
  const mockSignUp = vi.fn();
  const mockSendVerificationEmail = vi.fn();

  const createAuthContextValue = (overrides?: Partial<AuthContextValue>): AuthContextValue => ({
    authUser: null,
    user: null,
    role: 'user',
    isAuthenticated: false,
    isAdmin: false,
    isLoading: false,
    error: null,
    signIn: vi.fn(),
    signUp: mockSignUp,
    signInWithGoogle: vi.fn(),
    signOut: vi.fn(),
    sendPasswordReset: vi.fn(),
    sendVerificationEmail: mockSendVerificationEmail,
    changePassword: vi.fn(),
    deleteAccount: vi.fn(),
    clearError: vi.fn(),
    ...overrides,
  });

  const renderSignUpPage = (
    initialEntry: string = ROUTES.SIGNUP,
    authOverrides?: Partial<AuthContextValue>
  ) => {
    const authValue = createAuthContextValue(authOverrides);

    return render(
      <AuthContext.Provider value={authValue}>
        <MemoryRouter initialEntries={[initialEntry]}>
          <Routes>
            <Route path={ROUTES.SIGNUP} element={<SignUpPage />} />
            <Route path={ROUTES.LIBRARY} element={<div>Mock Library Page</div>} />
            <Route path={ROUTES.LOGIN} element={<div>Mock Login Page</div>} />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockSendVerificationEmail.mockResolvedValue(ok(undefined));
  });

  it('1. Renders signup form fields, labels, terms checkbox, and button', () => {
    renderSignUpPage();

    expect(
      screen.getByRole('heading', { level: 1, name: /Create an Account/i })
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/Display Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Password \(min\. 6 characters\)/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Confirm Password/i)).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /Terms of Service/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Create Account$/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Sign In/i })).toHaveAttribute('href', ROUTES.LOGIN);
  });

  it('2. Shows validation error when display name is less than 2 characters', async () => {
    const user = userEvent.setup();
    renderSignUpPage();

    await user.type(screen.getByLabelText(/Display Name/i), 'A');
    await user.type(screen.getByLabelText(/Email Address/i), 'alice@example.com');
    await user.type(screen.getByLabelText(/^Password \(min\. 6 characters\)/i), 'Password123');
    await user.type(screen.getByLabelText(/^Confirm Password/i), 'Password123');
    await user.click(screen.getByRole('checkbox', { name: /Terms of Service/i }));
    await user.click(screen.getByRole('button', { name: /^Create Account$/i }));

    expect(
      await screen.findByText(/Display name must be at least 2 characters/i)
    ).toBeInTheDocument();
    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it('3. Shows validation error when password is less than 6 characters', async () => {
    const user = userEvent.setup();
    renderSignUpPage();

    await user.type(screen.getByLabelText(/Display Name/i), 'Alice Smith');
    await user.type(screen.getByLabelText(/Email Address/i), 'alice@example.com');
    await user.type(screen.getByLabelText(/^Password \(min\. 6 characters\)/i), '12345');
    await user.type(screen.getByLabelText(/^Confirm Password/i), '12345');
    await user.click(screen.getByRole('checkbox', { name: /Terms of Service/i }));
    await user.click(screen.getByRole('button', { name: /^Create Account$/i }));

    expect(await screen.findByText(/Password must be at least 6 characters/i)).toBeInTheDocument();
    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it('4. Shows validation error when passwords do not match', async () => {
    const user = userEvent.setup();
    renderSignUpPage();

    await user.type(screen.getByLabelText(/Display Name/i), 'Alice Smith');
    await user.type(screen.getByLabelText(/Email Address/i), 'alice@example.com');
    await user.type(screen.getByLabelText(/^Password \(min\. 6 characters\)/i), 'Password123');
    await user.type(screen.getByLabelText(/^Confirm Password/i), 'DifferentPassword456');
    await user.click(screen.getByRole('checkbox', { name: /Terms of Service/i }));
    await user.click(screen.getByRole('button', { name: /^Create Account$/i }));

    expect(await screen.findByText(/Passwords do not match/i)).toBeInTheDocument();
    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it('5. Shows validation error when terms are not accepted', async () => {
    const user = userEvent.setup();
    renderSignUpPage();

    await user.type(screen.getByLabelText(/Display Name/i), 'Alice Smith');
    await user.type(screen.getByLabelText(/Email Address/i), 'alice@example.com');
    await user.type(screen.getByLabelText(/^Password \(min\. 6 characters\)/i), 'Password123');
    await user.type(screen.getByLabelText(/^Confirm Password/i), 'Password123');
    await user.click(screen.getByRole('button', { name: /^Create Account$/i }));

    expect(
      await screen.findByText(/You must agree to the Terms of Service & Privacy Policy/i)
    ).toBeInTheDocument();
    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it('6. Submits registration and displays verification state screen with resend cooldown', async () => {
    const user = userEvent.setup();
    const mockAuthUser: AuthUser = {
      uid: 'user-new-123',
      email: 'alice@example.com',
      emailVerified: false,
      displayName: 'Alice Smith',
      photoURL: null,
      isAnonymous: false,
      providerId: 'password',
    };

    mockSignUp.mockResolvedValueOnce(ok(mockAuthUser));

    renderSignUpPage();

    await user.type(screen.getByLabelText(/Display Name/i), 'Alice Smith');
    await user.type(screen.getByLabelText(/Email Address/i), 'alice@example.com');
    await user.type(screen.getByLabelText(/^Password \(min\. 6 characters\)/i), 'Password123');
    await user.type(screen.getByLabelText(/^Confirm Password/i), 'Password123');
    await user.click(screen.getByRole('checkbox', { name: /Terms of Service/i }));
    await user.click(screen.getByRole('button', { name: /^Create Account$/i }));

    expect(mockSignUp).toHaveBeenCalledWith({
      displayName: 'Alice Smith',
      email: 'alice@example.com',
      password: 'Password123',
    });

    expect(
      await screen.findByRole('heading', { level: 1, name: /Account Created!/i })
    ).toBeInTheDocument();
    expect(screen.getByText('alice@example.com')).toBeInTheDocument();
    expect(screen.getByText(/Resend Email in/i)).toBeInTheDocument();

    // Clicking "Continue to Library" navigates to /library
    await user.click(screen.getByRole('button', { name: /Continue to Library/i }));
    await waitFor(() => {
      expect(screen.getByText('Mock Library Page')).toBeInTheDocument();
    });
  });

  it('7. Displays error alert when sign up fails (e.g. email already exists)', async () => {
    const user = userEvent.setup();
    mockSignUp.mockResolvedValueOnce(
      err(new AppError('CONFLICT', 'An account with this email address already exists.'))
    );

    renderSignUpPage();

    await user.type(screen.getByLabelText(/Display Name/i), 'Alice Smith');
    await user.type(screen.getByLabelText(/Email Address/i), 'alice@example.com');
    await user.type(screen.getByLabelText(/^Password \(min\. 6 characters\)/i), 'Password123');
    await user.type(screen.getByLabelText(/^Confirm Password/i), 'Password123');
    await user.click(screen.getByRole('checkbox', { name: /Terms of Service/i }));
    await user.click(screen.getByRole('button', { name: /^Create Account$/i }));

    expect(
      await screen.findByText(/An account with this email address already exists\./i)
    ).toBeInTheDocument();
  });
});
