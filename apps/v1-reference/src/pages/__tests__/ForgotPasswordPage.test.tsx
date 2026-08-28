import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ForgotPasswordPage } from '../ForgotPasswordPage';
import { AuthContext } from '@/app/auth-context';
import type { AuthContextValue } from '@/types/auth.types';
import { ok, err } from '@/lib/result';
import { AppError } from '@/lib/errors';
import { ROUTES } from '@/constants/routes';

describe('ForgotPasswordPage Component', () => {
  const mockSendPasswordReset = vi.fn();

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
    signOut: vi.fn(),
    sendPasswordReset: mockSendPasswordReset,
    sendVerificationEmail: vi.fn(),
    changePassword: vi.fn(),
    deleteAccount: vi.fn(),
    clearError: vi.fn(),
    ...overrides,
  });

  const renderForgotPasswordPage = (
    initialEntry: string = ROUTES.FORGOT_PASSWORD,
    authOverrides?: Partial<AuthContextValue>
  ) => {
    const authValue = createAuthContextValue(authOverrides);

    return render(
      <AuthContext.Provider value={authValue}>
        <MemoryRouter initialEntries={[initialEntry]}>
          <Routes>
            <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
            <Route path={ROUTES.LOGIN} element={<div>Mock Login Page</div>} />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('1. Renders forgot password form elements, input, button, and back link', () => {
    renderForgotPasswordPage();

    expect(screen.getByRole('heading', { level: 1, name: /Reset Password/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Send Reset Instructions$/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Back to Sign In/i })).toHaveAttribute(
      'href',
      ROUTES.LOGIN
    );
  });

  it('2. Shows validation error when email is empty or invalid', async () => {
    const user = userEvent.setup();
    renderForgotPasswordPage();

    const submitBtn = screen.getByRole('button', { name: /^Send Reset Instructions$/i });
    await user.click(submitBtn);

    expect(
      await screen.findByText(/Email is required|Please enter a valid email address/i)
    ).toBeInTheDocument();
    expect(mockSendPasswordReset).not.toHaveBeenCalled();

    const emailInput = screen.getByLabelText(/Email Address/i);
    await user.type(emailInput, 'invalid-email');
    await user.click(submitBtn);

    expect(await screen.findByText(/Please enter a valid email address/i)).toBeInTheDocument();
  });

  it('3. Submits password reset and renders privacy-conscious confirmation state', async () => {
    const user = userEvent.setup();
    mockSendPasswordReset.mockResolvedValueOnce(ok(undefined));

    renderForgotPasswordPage();

    await user.type(screen.getByLabelText(/Email Address/i), 'user@example.com');
    await user.click(screen.getByRole('button', { name: /^Send Reset Instructions$/i }));

    expect(mockSendPasswordReset).toHaveBeenCalledWith({ email: 'user@example.com' });

    expect(
      await screen.findByRole('heading', { level: 1, name: /Check Your Inbox/i })
    ).toBeInTheDocument();
    expect(screen.getByText('user@example.com')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Back to Sign In/i })).toBeInTheDocument();

    // Clicking "Try a different email address" resets form
    const retryBtn = screen.getByRole('button', { name: /Try a different email address/i });
    await user.click(retryBtn);

    expect(screen.getByRole('heading', { level: 1, name: /Reset Password/i })).toBeInTheDocument();
  });

  it('4. Handles network error gracefully', async () => {
    const user = userEvent.setup();
    mockSendPasswordReset.mockResolvedValueOnce(
      err(AppError.network('Network error during authentication. Please check your connection.'))
    );

    renderForgotPasswordPage();

    await user.type(screen.getByLabelText(/Email Address/i), 'user@example.com');
    await user.click(screen.getByRole('button', { name: /^Send Reset Instructions$/i }));

    expect(
      await screen.findByText(
        /Network error during authentication\. Please check your connection\./i
      )
    ).toBeInTheDocument();
  });
});
