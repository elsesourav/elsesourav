import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { SettingsPage } from '../SettingsPage';
import { AuthContext } from '@/app/auth-context';
import { ThemeContext } from '@/app/theme-context';
import { userService } from '@/services/user.service';
import type { AuthContextValue, AuthUser } from '@/types/auth.types';
import type { User } from '@/types/user.types';
import { ok } from '@/lib/result';
import { ROUTES } from '@/constants/routes';

describe('SettingsPage Component', () => {
  const mockSignOut = vi.fn();
  const mockSendVerificationEmail = vi.fn();
  const mockChangePassword = vi.fn();
  const mockDeleteAccount = vi.fn();
  const mockSetThemeMode = vi.fn();

  const mockUser: User = {
    id: 'user-100',
    email: 'sourav@example.com',
    displayName: 'Sourav Mukherjee',
    username: 'sourav_dev',
    photoUrl: 'https://example.com/avatar.jpg',
    bio: 'Software engineer and platform architect.',
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
    photoURL: 'https://example.com/avatar.jpg',
    isAnonymous: false,
    providerId: 'password',
    createdAt: 1700000000000,
  };

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
    sendVerificationEmail: mockSendVerificationEmail,
    changePassword: mockChangePassword,
    deleteAccount: mockDeleteAccount,
    clearError: vi.fn(),
    ...overrides,
  });

  const renderSettingsPage = (
    initialEntry: string = ROUTES.SETTINGS,
    defaultTab?: 'profile' | 'preferences' | 'security',
    authOverrides?: Partial<AuthContextValue>
  ) => {
    const authValue = createAuthContextValue(authOverrides);

    return render(
      <ThemeContext.Provider
        value={{
          themeMode: 'dark',
          resolvedTheme: 'dark',
          setThemeMode: mockSetThemeMode,
          toggleTheme: vi.fn(),
        }}
      >
        <AuthContext.Provider value={authValue}>
          <MemoryRouter initialEntries={[initialEntry]}>
            <Routes>
              <Route path={ROUTES.SETTINGS} element={<SettingsPage defaultTab={defaultTab} />} />
              <Route
                path={ROUTES.SETTINGS_PROFILE}
                element={<SettingsPage defaultTab="profile" />}
              />
              <Route
                path={ROUTES.SETTINGS_PREFERENCES}
                element={<SettingsPage defaultTab="preferences" />}
              />
              <Route
                path={ROUTES.SETTINGS_SECURITY}
                element={<SettingsPage defaultTab="security" />}
              />
              <Route path={ROUTES.HOME} element={<div>Home Landing Page</div>} />
            </Routes>
          </MemoryRouter>
        </AuthContext.Provider>
      </ThemeContext.Provider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockSignOut.mockResolvedValue(ok(undefined));
    mockSendVerificationEmail.mockResolvedValue(ok(undefined));
    mockChangePassword.mockResolvedValue(ok(undefined));
    mockDeleteAccount.mockResolvedValue(ok(undefined));
    vi.spyOn(userService, 'updateUserProfile').mockResolvedValue(ok(mockUser));
    vi.spyOn(userService, 'updateUserPreferences').mockResolvedValue(ok(mockUser));
    vi.spyOn(userService, 'softDeleteUser').mockResolvedValue(ok(mockUser));
  });

  it('1. Loads user profile and account summary header correctly', () => {
    renderSettingsPage();

    expect(
      screen.getByRole('heading', { level: 1, name: /Sourav Mukherjee/i })
    ).toBeInTheDocument();
    expect(screen.getByText('sourav@example.com')).toBeInTheDocument();
    expect(screen.getByText(/Verified/i)).toBeInTheDocument();
    expect(screen.getByText(/Member since/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign Out/i })).toBeInTheDocument();
  });

  it('2. Updates profile details successfully and displays feedback banner', async () => {
    const user = userEvent.setup();
    renderSettingsPage();

    const nameInput = screen.getByLabelText(/Display Name/i);
    await user.clear(nameInput);
    await user.type(nameInput, 'Sourav M. (Architect)');

    const bioInput = screen.getByLabelText(/Bio \/ About/i);
    await user.clear(bioInput);
    await user.type(bioInput, 'Updated engineer bio.');

    const saveBtn = screen.getByRole('button', { name: /Save Profile/i });
    await user.click(saveBtn);

    expect(userService.updateUserProfile).toHaveBeenCalledWith(
      'user-100',
      expect.objectContaining({
        displayName: 'Sourav M. (Architect)',
        bio: 'Updated engineer bio.',
      })
    );

    expect(await screen.findByText(/Profile updated successfully\./i)).toBeInTheDocument();
  });

  it('3. Ensures protected fields (UID, Role, Status, CreatedAt) cannot be edited', () => {
    renderSettingsPage();

    expect(screen.queryByLabelText(/^UID$/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/^Role$/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/^Status$/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/^CreatedAt$/i)).not.toBeInTheDocument();
  });

  it('4. Switches tabs and updates preferences (theme, notifications, motion)', async () => {
    const user = userEvent.setup();
    renderSettingsPage(ROUTES.SETTINGS, 'preferences');

    expect(
      screen.getByRole('heading', { level: 2, name: /Display & Platform Preferences/i })
    ).toBeInTheDocument();

    // Select Light Mode theme option card
    const lightModeBtn = screen.getByRole('button', { name: /Light Mode/i });
    await user.click(lightModeBtn);

    // Toggle reduce motion
    const motionCheckbox = screen.getByRole('checkbox', { name: /Reduce Motion/i });
    await user.click(motionCheckbox);

    // Save preferences
    const savePrefsBtn = screen.getByRole('button', { name: /Save Preferences/i });
    await user.click(savePrefsBtn);

    expect(mockSetThemeMode).toHaveBeenCalledWith('light');

    expect(userService.updateUserPreferences).toHaveBeenCalledWith(
      'user-100',
      expect.objectContaining({
        theme: 'light',
        reduceMotion: true,
      })
    );

    expect(await screen.findByText(/Preferences saved successfully\./i)).toBeInTheDocument();
  });

  it('5. Handles password change flow in Security tab', async () => {
    const user = userEvent.setup();
    renderSettingsPage(ROUTES.SETTINGS, 'security');

    expect(screen.getByRole('heading', { level: 2, name: /Change Password/i })).toBeInTheDocument();

    await user.type(screen.getByLabelText(/Current Password/i), 'OldPass123');
    await user.type(
      screen.getByLabelText(/New Password \(min 6 characters\)/i),
      'NewSecretPass456'
    );
    await user.type(screen.getByLabelText(/Confirm New Password/i), 'NewSecretPass456');

    const updatePasswordBtn = screen.getByRole('button', { name: /Update Password/i });
    await user.click(updatePasswordBtn);

    expect(mockChangePassword).toHaveBeenCalledWith('OldPass123', 'NewSecretPass456');
    expect(await screen.findByText(/Password updated successfully\./i)).toBeInTheDocument();
  });

  it('6. Shows validation error when new passwords do not match', async () => {
    const user = userEvent.setup();
    renderSettingsPage(ROUTES.SETTINGS, 'security');

    await user.type(screen.getByLabelText(/Current Password/i), 'OldPass123');
    await user.type(
      screen.getByLabelText(/New Password \(min 6 characters\)/i),
      'NewSecretPass456'
    );
    await user.type(screen.getByLabelText(/Confirm New Password/i), 'MismatchPassword789');

    await user.click(screen.getByRole('button', { name: /Update Password/i }));

    expect(await screen.findByText(/New passwords do not match\./i)).toBeInTheDocument();
    expect(mockChangePassword).not.toHaveBeenCalled();
  });

  it('7. Handles resending email verification link for unverified users', async () => {
    const user = userEvent.setup();
    renderSettingsPage(ROUTES.SETTINGS, 'security', {
      authUser: { ...mockAuthUser, emailVerified: false },
    });

    expect(screen.getAllByText(/Unverified/i).length).toBeGreaterThan(0);

    const resendBtn = screen.getByRole('button', { name: /Resend Link/i });
    await user.click(resendBtn);

    expect(mockSendVerificationEmail).toHaveBeenCalled();
    expect(
      await screen.findByText(/Verification email sent! Please check your inbox\./i)
    ).toBeInTheDocument();
  });

  it('8. Handles sign out action and redirects', async () => {
    const user = userEvent.setup();
    renderSettingsPage();

    const signOutBtn = screen.getByRole('button', { name: /Sign Out/i });
    await user.click(signOutBtn);

    expect(mockSignOut).toHaveBeenCalled();
    await waitFor(() => {
      expect(screen.getByText('Home Landing Page')).toBeInTheDocument();
    });
  });

  it('9. Opens Danger Zone confirmation modal and deletes account safely', async () => {
    const user = userEvent.setup();
    renderSettingsPage(ROUTES.SETTINGS, 'security');

    const deleteBtn = screen.getByRole('button', { name: /Delete Account/i });
    await user.click(deleteBtn);

    expect(
      screen.getByRole('dialog', { name: /Confirm Permanent Account Deletion/i })
    ).toBeInTheDocument();

    const confirmPasswordInput = screen.getByLabelText(/Enter your account password to confirm/i);
    await user.type(confirmPasswordInput, 'MyPassword123');

    const confirmDeleteBtn = screen.getByRole('button', { name: /Confirm Delete/i });
    await user.click(confirmDeleteBtn);

    expect(userService.softDeleteUser).toHaveBeenCalledWith('user-100');
    expect(mockDeleteAccount).toHaveBeenCalledWith('MyPassword123');

    await waitFor(() => {
      expect(screen.getByText('Home Landing Page')).toBeInTheDocument();
    });
  });

  it('10. Renders loading skeletons when authentication session is loading', () => {
    renderSettingsPage(ROUTES.SETTINGS, 'profile', { isLoading: true });

    expect(screen.getByRole('main', { busy: true })).toBeInTheDocument();
  });
});
