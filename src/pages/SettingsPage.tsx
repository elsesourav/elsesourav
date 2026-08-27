import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User as UserIcon,
  Sliders,
  Shield,
  CheckCircle2,
  AlertCircle,
  LogOut,
  Trash2,
  Eye,
  EyeOff,
  Sun,
  Moon,
  Laptop,
  ShieldAlert,
  Send,
} from 'lucide-react';
import { Badge, Button, Input, Skeleton, Dialog, SEO } from '@/components';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { userService } from '@/services/user.service';
import { ROUTES } from '@/constants/routes';
import { updateUserProfileSchema } from '@/schemas/user.schema';
import type { ThemeMode } from '@/types/theme.types';
import './SettingsPage.css';

export interface SettingsPageProps {
  readonly defaultTab?: 'profile' | 'preferences' | 'security';
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ defaultTab = 'profile' }) => {
  const navigate = useNavigate();
  const {
    user,
    authUser,
    isAdmin,
    isLoading: isAuthLoading,
    signOut,
    sendVerificationEmail,
    changePassword,
    deleteAccount,
  } = useAuth();
  const { themeMode, setThemeMode } = useTheme();

  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'security'>(defaultTab);

  // Profile form state
  const [displayName, setDisplayName] = useState(user?.displayName || authUser?.displayName || '');
  const [username, setUsername] = useState(user?.username || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [photoUrl, setPhotoUrl] = useState(user?.photoUrl || authUser?.photoURL || '');
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Preferences form state
  const [selectedTheme, setSelectedTheme] = useState<ThemeMode>(
    user?.preferences?.theme || themeMode || 'dark'
  );
  const [emailNotifications, setEmailNotifications] = useState(
    user?.preferences?.emailNotifications ?? true
  );
  const [reduceMotion, setReduceMotion] = useState(user?.preferences?.reduceMotion ?? false);
  const [compactView, setCompactView] = useState(user?.preferences?.compactView ?? false);
  const [isSavingPrefs, setIsSavingPrefs] = useState(false);
  const [prefsSuccess, setPrefsSuccess] = useState<string | null>(null);
  const [prefsError, setPrefsError] = useState<string | null>(null);

  // Password Change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Verification resend cooldown
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isResendingVerification, setIsResendingVerification] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState<string | null>(null);

  // Account Deletion Dialog State
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteConfirmPassword, setDeleteConfirmPassword] = useState('');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const userId = user?.id || authUser?.uid || '';
  const email = user?.email || authUser?.email || '';
  const emailVerified = authUser?.emailVerified ?? false;

  // Sync state when user profile loads
  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
      setUsername(user.username || '');
      setBio(user.bio || '');
      setPhotoUrl(user.photoUrl || '');
      if (user.preferences) {
        setSelectedTheme(user.preferences.theme);
        setEmailNotifications(user.preferences.emailNotifications);
        setReduceMotion(user.preferences.reduceMotion);
        setCompactView(user.preferences.compactView);
      }
    }
  }, [user]);

  // Handle Tab Switch & URL Sync
  const handleTabChange = (tab: 'profile' | 'preferences' | 'security') => {
    setActiveTab(tab);
    setProfileSuccess(null);
    setProfileError(null);
    setPrefsSuccess(null);
    setPrefsError(null);
    setPasswordSuccess(null);
    setPasswordError(null);

    const path =
      tab === 'profile'
        ? ROUTES.SETTINGS_PROFILE
        : tab === 'preferences'
          ? ROUTES.SETTINGS_PREFERENCES
          : ROUTES.SETTINGS_SECURITY;
    window.history.replaceState(null, '', path);
  };

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Initials for avatar
  const initials = useMemo(() => {
    const name = displayName || email || 'User';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }, [displayName, email]);

  // ---------------------------------------------------------------------------
  // Profile Save
  // ---------------------------------------------------------------------------
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccess(null);
    setProfileError(null);

    if (!userId) return;

    const payload = {
      displayName: displayName.trim(),
      username: username.trim() || undefined,
      bio: bio.trim() || undefined,
      photoUrl: photoUrl.trim() || undefined,
    };

    const validation = updateUserProfileSchema.safeParse(payload);
    if (!validation.success) {
      setProfileError(validation.error.issues[0]?.message || 'Invalid profile information');
      return;
    }

    setIsSavingProfile(true);

    const res = await userService.updateUserProfile(userId, validation.data);

    setIsSavingProfile(false);

    if (res.success) {
      setProfileSuccess('Profile updated successfully.');
    } else {
      setProfileError(res.error.message);
    }
  };

  // ---------------------------------------------------------------------------
  // Preferences Save
  // ---------------------------------------------------------------------------
  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    setPrefsSuccess(null);
    setPrefsError(null);

    if (!userId) return;

    setIsSavingPrefs(true);

    // Immediately synchronize local ThemeContext
    setThemeMode(selectedTheme);

    const res = await userService.updateUserPreferences(userId, {
      theme: selectedTheme,
      emailNotifications,
      reduceMotion,
      compactView,
    });

    setIsSavingPrefs(false);

    if (res.success) {
      setPrefsSuccess('Preferences saved successfully.');
    } else {
      setPrefsError(res.error.message);
    }
  };

  // ---------------------------------------------------------------------------
  // Change Password
  // ---------------------------------------------------------------------------
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSuccess(null);
    setPasswordError(null);

    if (!currentPassword) {
      setPasswordError('Current password is required.');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setIsChangingPassword(true);

    const res = await changePassword(currentPassword, newPassword);

    setIsChangingPassword(false);

    if (res.success) {
      setPasswordSuccess('Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setPasswordError(res.error.message);
    }
  };

  // ---------------------------------------------------------------------------
  // Resend Email Verification
  // ---------------------------------------------------------------------------
  const handleResendVerification = async () => {
    if (resendCooldown > 0 || isResendingVerification) return;

    setIsResendingVerification(true);
    setVerificationSuccess(null);

    const res = await sendVerificationEmail();

    setIsResendingVerification(false);

    if (res.success) {
      setVerificationSuccess('Verification email sent! Please check your inbox.');
      setResendCooldown(60);
    }
  };

  // ---------------------------------------------------------------------------
  // Delete Account
  // ---------------------------------------------------------------------------
  const handleDeleteAccount = async () => {
    if (!userId) return;

    setIsDeletingAccount(true);
    setDeleteError(null);

    // 1. Soft delete Firestore user record
    await userService.softDeleteUser(userId);

    // 2. Delete Firebase Auth identity
    const res = await deleteAccount(deleteConfirmPassword.trim() || undefined);

    setIsDeletingAccount(false);

    if (res.success) {
      setIsDeleteDialogOpen(false);
      navigate(ROUTES.HOME, { replace: true });
    } else {
      setDeleteError(res.error.message);
    }
  };

  if (isAuthLoading) {
    return (
      <main className="settings-page" aria-busy="true">
        <div className="settings-header-card">
          <div className="settings-header-left">
            <Skeleton variant="rounded" width="72px" height="72px" />
            <div>
              <Skeleton variant="text" width="180px" height="28px" className="mb-2" />
              <Skeleton variant="text" width="220px" height="18px" />
            </div>
          </div>
        </div>
        <div className="settings-section-card">
          <Skeleton variant="text" width="100%" height="40px" className="mb-4" />
          <Skeleton variant="text" width="100%" height="40px" className="mb-4" />
          <Skeleton variant="text" width="100%" height="40px" />
        </div>
      </main>
    );
  }

  return (
    <main className="settings-page" aria-labelledby="settings-main-heading">
      <SEO
        title="Account Settings"
        description="Manage your profile information, application preferences, and security settings."
        canonicalPath="/settings"
        noIndex
      />
      {/* Account Summary Header */}
      <header className="settings-header-card">
        <div className="settings-header-left">
          <div className="settings-avatar-wrapper">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={displayName || 'User profile'}
                className="settings-avatar"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="settings-avatar" aria-hidden="true">
                {initials}
              </div>
            )}
          </div>
          <div className="settings-user-info">
            <div className="settings-user-name-row">
              <h1 id="settings-main-heading" className="settings-user-name">
                {displayName || 'User Profile'}
              </h1>
              {emailVerified ? (
                <Badge variant="success" size="sm">
                  Verified
                </Badge>
              ) : (
                <Badge variant="warning" size="sm">
                  Unverified
                </Badge>
              )}
              {isAdmin && (
                <Badge variant="accent" size="sm">
                  Admin
                </Badge>
              )}
            </div>
            <p className="settings-user-email">{email}</p>
            <span className="settings-user-meta">
              Member since{' '}
              {new Date(user?.createdAt || Date.now()).toLocaleDateString('en-US', {
                month: 'short',
                year: 'numeric',
              })}
            </span>
          </div>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => signOut().then(() => navigate(ROUTES.HOME))}
          leftIcon={<LogOut size={15} />}
        >
          Sign Out
        </Button>
      </header>

      {/* Tabs Navigation */}
      <nav className="settings-tabs" role="tablist" aria-label="Settings Navigation">
        <button
          role="tab"
          aria-selected={activeTab === 'profile'}
          className={`settings-tab-btn ${activeTab === 'profile' ? 'settings-tab-btn--active' : ''}`}
          onClick={() => handleTabChange('profile')}
        >
          <UserIcon size={16} aria-hidden="true" />
          <span>Profile</span>
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'preferences'}
          className={`settings-tab-btn ${activeTab === 'preferences' ? 'settings-tab-btn--active' : ''}`}
          onClick={() => handleTabChange('preferences')}
        >
          <Sliders size={16} aria-hidden="true" />
          <span>Preferences</span>
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'security'}
          className={`settings-tab-btn ${activeTab === 'security' ? 'settings-tab-btn--active' : ''}`}
          onClick={() => handleTabChange('security')}
        >
          <Shield size={16} aria-hidden="true" />
          <span>Security</span>
        </button>
      </nav>

      {/* =========================================================================
          TAB 1: PROFILE SETTINGS
         ========================================================================= */}
      {activeTab === 'profile' && (
        <section className="settings-section-card" aria-labelledby="profile-heading">
          <div className="settings-section-header">
            <h2 id="profile-heading" className="settings-section-title">
              Public Profile Information
            </h2>
            <p className="settings-section-subtitle">
              Manage how your name and identity appear across comments, reviews, and library shares.
            </p>
          </div>

          {profileSuccess && (
            <div
              className="settings-feedback-banner settings-feedback-banner--success"
              role="status"
            >
              <CheckCircle2 size={18} aria-hidden="true" />
              <span>{profileSuccess}</span>
            </div>
          )}

          {profileError && (
            <div className="settings-feedback-banner settings-feedback-banner--error" role="alert">
              <AlertCircle size={18} aria-hidden="true" />
              <span>{profileError}</span>
            </div>
          )}

          <form className="settings-form" onSubmit={handleSaveProfile} noValidate>
            <div className="settings-form-row">
              <div className="settings-form-group">
                <label htmlFor="settings-display-name" className="settings-label">
                  Display Name
                </label>
                <Input
                  id="settings-display-name"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your full name or alias"
                  disabled={isSavingProfile}
                  required
                />
              </div>

              <div className="settings-form-group">
                <label htmlFor="settings-username" className="settings-label">
                  Username (optional)
                </label>
                <Input
                  id="settings-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase())}
                  placeholder="e.g. sourav_dev"
                  disabled={isSavingProfile}
                />
              </div>
            </div>

            <div className="settings-form-group">
              <label htmlFor="settings-photo-url" className="settings-label">
                Avatar Image URL (optional)
              </label>
              <Input
                id="settings-photo-url"
                type="url"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                placeholder="https://example.com/avatar.png"
                disabled={isSavingProfile}
              />
            </div>

            <div className="settings-form-group">
              <div className="settings-label">
                <label htmlFor="settings-bio">Bio / About</label>
                <span className="settings-char-count">{bio.length} / 300</span>
              </div>
              <textarea
                id="settings-bio"
                className="settings-textarea"
                maxLength={300}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Briefly tell the developer community about your background..."
                disabled={isSavingProfile}
              />
            </div>

            <div className="settings-form-actions">
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isSavingProfile}
                disabled={isSavingProfile}
              >
                Save Profile
              </Button>
            </div>
          </form>
        </section>
      )}

      {/* =========================================================================
          TAB 2: PREFERENCES SETTINGS
         ========================================================================= */}
      {activeTab === 'preferences' && (
        <section className="settings-section-card" aria-labelledby="preferences-heading">
          <div className="settings-section-header">
            <h2 id="preferences-heading" className="settings-section-title">
              Display & Platform Preferences
            </h2>
            <p className="settings-section-subtitle">
              Customize your aesthetic theme, accessibility motion, and notifications.
            </p>
          </div>

          {prefsSuccess && (
            <div
              className="settings-feedback-banner settings-feedback-banner--success"
              role="status"
            >
              <CheckCircle2 size={18} aria-hidden="true" />
              <span>{prefsSuccess}</span>
            </div>
          )}

          {prefsError && (
            <div className="settings-feedback-banner settings-feedback-banner--error" role="alert">
              <AlertCircle size={18} aria-hidden="true" />
              <span>{prefsError}</span>
            </div>
          )}

          <form className="settings-form" onSubmit={handleSavePreferences}>
            <div className="settings-form-group">
              <label className="settings-label" style={{ marginBottom: 'var(--space-2)' }}>
                Theme Appearance
              </label>
              <div className="settings-theme-grid">
                <button
                  type="button"
                  className={`settings-theme-card ${selectedTheme === 'dark' ? 'settings-theme-card--active' : ''}`}
                  onClick={() => setSelectedTheme('dark')}
                  aria-pressed={selectedTheme === 'dark'}
                >
                  <Moon size={22} color="var(--color-primary-400)" aria-hidden="true" />
                  <span className="settings-theme-card__label">Dark Mode</span>
                  <span className="settings-theme-card__desc">Sleek glassmorphism</span>
                </button>

                <button
                  type="button"
                  className={`settings-theme-card ${selectedTheme === 'light' ? 'settings-theme-card--active' : ''}`}
                  onClick={() => setSelectedTheme('light')}
                  aria-pressed={selectedTheme === 'light'}
                >
                  <Sun size={22} color="#f59e0b" aria-hidden="true" />
                  <span className="settings-theme-card__label">Light Mode</span>
                  <span className="settings-theme-card__desc">Clean high contrast</span>
                </button>

                <button
                  type="button"
                  className={`settings-theme-card ${selectedTheme === 'system' ? 'settings-theme-card--active' : ''}`}
                  onClick={() => setSelectedTheme('system')}
                  aria-pressed={selectedTheme === 'system'}
                >
                  <Laptop size={22} color="var(--color-text-secondary)" aria-hidden="true" />
                  <span className="settings-theme-card__label">System Default</span>
                  <span className="settings-theme-card__desc">Sync with OS</span>
                </button>
              </div>
            </div>

            <div className="settings-toggle-row">
              <div className="settings-toggle-info">
                <p className="settings-toggle-title">Email Notifications</p>
                <p className="settings-toggle-desc">
                  Receive support ticket replies and platform software announcements.
                </p>
              </div>
              <input
                id="toggle-email-notifications"
                type="checkbox"
                aria-label="Email Notifications"
                checked={emailNotifications}
                onChange={(e) => setEmailNotifications(e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
            </div>

            <div className="settings-toggle-row">
              <div className="settings-toggle-info">
                <p className="settings-toggle-title">Reduce Motion</p>
                <p className="settings-toggle-desc">
                  Minimize transition animations and decorative transforms across the UI.
                </p>
              </div>
              <input
                id="toggle-reduce-motion"
                type="checkbox"
                aria-label="Reduce Motion"
                checked={reduceMotion}
                onChange={(e) => setReduceMotion(e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
            </div>

            <div className="settings-toggle-row">
              <div className="settings-toggle-info">
                <p className="settings-toggle-title">Compact View Density</p>
                <p className="settings-toggle-desc">
                  Display app catalogs and ticket lists in a denser layout for power users.
                </p>
              </div>
              <input
                id="toggle-compact-view"
                type="checkbox"
                aria-label="Compact View Density"
                checked={compactView}
                onChange={(e) => setCompactView(e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
            </div>

            <div className="settings-form-actions">
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isSavingPrefs}
                disabled={isSavingPrefs}
              >
                Save Preferences
              </Button>
            </div>
          </form>
        </section>
      )}

      {/* =========================================================================
          TAB 3: SECURITY SETTINGS
         ========================================================================= */}
      {activeTab === 'security' && (
        <>
          {/* Security Information Overview */}
          <section className="settings-section-card" aria-labelledby="security-overview-heading">
            <div className="settings-section-header">
              <h2 id="security-overview-heading" className="settings-section-title">
                Security & Authentication Overview
              </h2>
              <p className="settings-section-subtitle">
                Review your session credentials and verification status.
              </p>
            </div>

            {verificationSuccess && (
              <div
                className="settings-feedback-banner settings-feedback-banner--success"
                role="status"
              >
                <CheckCircle2 size={18} aria-hidden="true" />
                <span>{verificationSuccess}</span>
              </div>
            )}

            <div className="settings-info-item">
              <span className="settings-info-label">Account Email</span>
              <span className="settings-info-value">{email}</span>
            </div>

            <div className="settings-info-item">
              <span className="settings-info-label">Email Verification</span>
              <div className="settings-info-value">
                {emailVerified ? (
                  <Badge variant="success" size="sm">
                    Verified
                  </Badge>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <Badge variant="warning" size="sm">
                      Unverified
                    </Badge>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleResendVerification}
                      isLoading={isResendingVerification}
                      disabled={resendCooldown > 0 || isResendingVerification}
                      leftIcon={<Send size={13} />}
                    >
                      {resendCooldown > 0 ? `Resend (${resendCooldown}s)` : 'Resend Link'}
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="settings-info-item">
              <span className="settings-info-label">Authentication Provider</span>
              <span className="settings-info-value">
                {authUser?.providerId === 'google.com' ? 'Google OAuth' : 'Email & Password'}
              </span>
            </div>
          </section>

          {/* Change Password Form */}
          {authUser?.providerId !== 'google.com' && (
            <section className="settings-section-card" aria-labelledby="change-password-heading">
              <div className="settings-section-header">
                <h2 id="change-password-heading" className="settings-section-title">
                  Change Password
                </h2>
                <p className="settings-section-subtitle">
                  Update your account password. You will need your current password for security
                  verification.
                </p>
              </div>

              {passwordSuccess && (
                <div
                  className="settings-feedback-banner settings-feedback-banner--success"
                  role="status"
                >
                  <CheckCircle2 size={18} aria-hidden="true" />
                  <span>{passwordSuccess}</span>
                </div>
              )}

              {passwordError && (
                <div
                  className="settings-feedback-banner settings-feedback-banner--error"
                  role="alert"
                >
                  <AlertCircle size={18} aria-hidden="true" />
                  <span>{passwordError}</span>
                </div>
              )}

              <form className="settings-form" onSubmit={handleChangePassword} noValidate>
                <div className="settings-form-group">
                  <label htmlFor="settings-current-password" className="settings-label">
                    Current Password
                  </label>
                  <div className="auth-input-wrapper">
                    <Input
                      id="settings-current-password"
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                      disabled={isChangingPassword}
                      required
                    />
                    <button
                      type="button"
                      className="auth-password-toggle"
                      onClick={() => setShowCurrentPassword((prev) => !prev)}
                      aria-label={showCurrentPassword ? 'Hide password' : 'Show password'}
                    >
                      {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="settings-form-row">
                  <div className="settings-form-group">
                    <label htmlFor="settings-new-password" className="settings-label">
                      New Password (min 6 characters)
                    </label>
                    <div className="auth-input-wrapper">
                      <Input
                        id="settings-new-password"
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Create new password"
                        disabled={isChangingPassword}
                        required
                      />
                      <button
                        type="button"
                        className="auth-password-toggle"
                        onClick={() => setShowNewPassword((prev) => !prev)}
                        aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                      >
                        {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="settings-form-group">
                    <label htmlFor="settings-confirm-new-password" className="settings-label">
                      Confirm New Password
                    </label>
                    <Input
                      id="settings-confirm-new-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      disabled={isChangingPassword}
                      required
                    />
                  </div>
                </div>

                <div className="settings-form-actions">
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    isLoading={isChangingPassword}
                    disabled={isChangingPassword}
                  >
                    Update Password
                  </Button>
                </div>
              </form>
            </section>
          )}

          {/* Account Deletion (Danger Zone) */}
          <section
            className="settings-section-card settings-danger-card"
            aria-labelledby="danger-heading"
          >
            <div className="settings-section-header">
              <h2 id="danger-heading" className="settings-section-title">
                Danger Zone: Account Deletion
              </h2>
              <p className="settings-section-subtitle">
                Permanently delete your user profile, saved software library bookmarks, and
                settings. This action is irreversible.
              </p>
            </div>

            <Button
              variant="destructive"
              size="md"
              onClick={() => setIsDeleteDialogOpen(true)}
              leftIcon={<Trash2 size={16} />}
            >
              Delete Account
            </Button>
          </section>

          {/* Delete Account Confirmation Dialog */}
          <Dialog
            isOpen={isDeleteDialogOpen}
            onClose={() => setIsDeleteDialogOpen(false)}
            title="Confirm Permanent Account Deletion"
          >
            <div style={{ padding: 'var(--space-2) 0' }}>
              <div
                className="settings-feedback-banner settings-feedback-banner--error"
                style={{ marginBottom: 'var(--space-4)' }}
              >
                <ShieldAlert size={20} aria-hidden="true" />
                <span>
                  Warning: All saved apps, reviews, tickets, and account preferences will be
                  permanently wiped.
                </span>
              </div>

              {deleteError && (
                <div
                  className="auth-error-alert"
                  role="alert"
                  style={{ marginBottom: 'var(--space-4)' }}
                >
                  <AlertCircle size={16} aria-hidden="true" />
                  <span>{deleteError}</span>
                </div>
              )}

              {authUser?.providerId !== 'google.com' && (
                <div className="settings-form-group" style={{ marginBottom: 'var(--space-4)' }}>
                  <label htmlFor="delete-confirm-password" className="settings-label">
                    Enter your account password to confirm
                  </label>
                  <Input
                    id="delete-confirm-password"
                    type="password"
                    value={deleteConfirmPassword}
                    onChange={(e) => setDeleteConfirmPassword(e.target.value)}
                    placeholder="Enter password"
                    disabled={isDeletingAccount}
                    autoFocus
                  />
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => setIsDeleteDialogOpen(false)}
                  disabled={isDeletingAccount}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  size="md"
                  onClick={handleDeleteAccount}
                  isLoading={isDeletingAccount}
                  disabled={isDeletingAccount}
                  leftIcon={<Trash2 size={16} />}
                >
                  Confirm Delete
                </Button>
              </div>
            </div>
          </Dialog>
        </>
      )}
    </main>
  );
};
