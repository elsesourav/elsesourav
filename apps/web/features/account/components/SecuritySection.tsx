'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, Button, Input } from '@elsesourav/ui';
import type { User } from '@elsesourav/types';
import {
  Shield,
  Key,
  CheckCircle2,
  Lock,
  LogOut,
  AlertCircle,
  Loader2,
  Check,
  ShieldAlert,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { createAuthBrowserClient } from '@elsesourav/auth';
import { deleteAccountAction } from '../actions/account-actions';

interface SecuritySectionProps {
  user: User & { provider?: 'email' | 'google' | 'github' };
}

export function SecuritySection({ user }: SecuritySectionProps) {
  const isOAuth = user.provider === 'google' || user.provider === 'github';

  // Password update state
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = React.useState(false);
  const [passwordSuccess, setPasswordSuccess] = React.useState<string | null>(null);
  const [passwordError, setPasswordError] = React.useState<string | null>(null);

  // Delete Account state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = React.useState('');
  const [deleteReason, setDeleteReason] = React.useState('');
  const [isDeletingAccount, setIsDeletingAccount] = React.useState(false);
  const [deleteError, setDeleteError] = React.useState<string | null>(null);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSuccess(null);
    setPasswordError(null);

    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    try {
      setIsUpdatingPassword(true);
      const supabase = createAuthBrowserClient();
      const { error } = await supabase.auth.updateUser({ password: newPassword });

      if (error) {
        setPasswordError(error.message);
      } else {
        setPasswordSuccess('Password updated successfully.');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch {
      setPasswordError('An unexpected error occurred while updating your password.');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (deleteConfirmation !== 'DELETE MY ACCOUNT' || isDeletingAccount) return;

    setIsDeletingAccount(true);
    setDeleteError(null);

    try {
      const res = await deleteAccountAction({
        confirmation: deleteConfirmation,
        reason: deleteReason.trim() || undefined,
      });

      if (res.success) {
        window.location.href = '/api/auth/logout';
      } else {
        setDeleteError(res.error || 'Failed to delete account.');
        setIsDeletingAccount(false);
      }
    } catch {
      setDeleteError('An unexpected error occurred. Please try again.');
      setIsDeletingAccount(false);
    }
  };

  return (
    <div className="space-y-6 max-w-xl">
      {/* Password & Authentication Credentials */}
      <Card className="bg-card text-card-foreground border-border shadow-sm rounded-2xl sm:rounded-3xl">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-500" />
            <CardTitle className="text-base text-foreground">Password & Security</CardTitle>
          </div>
          <CardDescription className="text-xs text-muted-foreground">
            Manage your account password, authentication credentials, and session protection.
          </CardDescription>
        </CardHeader>

        <div className="p-6 pt-2 space-y-6">
          {/* Password Management for Email/Password Users */}
          {!isOAuth ? (
            <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-primary" />
                  <span className="text-xs font-semibold text-foreground">Update Password</span>
                </div>
                <Link
                  href="/forgot-password"
                  className="text-[11px] text-primary hover:underline flex items-center gap-1 font-medium"
                >
                  <Key className="w-3 h-3" /> Forgot password?
                </Link>
              </div>

              <form onSubmit={handleUpdatePassword} className="space-y-3">
                {passwordSuccess && (
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400">
                    <Check className="w-3.5 h-3.5" />
                    <span>{passwordSuccess}</span>
                  </div>
                )}
                {passwordError && (
                  <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2 text-xs text-rose-600 dark:text-rose-400">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{passwordError}</span>
                  </div>
                )}

                <div className="space-y-2">
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="New password (min 8 characters)"
                    className="bg-background border-border text-xs rounded-xl text-foreground"
                  />
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="bg-background border-border text-xs rounded-xl text-foreground"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isUpdatingPassword || !newPassword || !confirmPassword}
                  size="sm"
                  className="text-xs font-semibold px-4 py-2 rounded-xl gap-1.5 shadow-sm"
                >
                  {isUpdatingPassword ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Updating Password...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span>Set New Password</span>
                    </>
                  )}
                </Button>
              </form>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                <Lock className="w-4 h-4 text-primary" />
                <span>Managed by {user.provider === 'google' ? 'Google' : 'GitHub'}</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Your account signs in via {user.provider === 'google' ? 'Google' : 'GitHub'} OAuth single sign-on. Password updates are managed through your provider.
              </p>
            </div>
          )}

          {/* Active Session Sign Out */}
          <div className="pt-2 border-t border-border flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-foreground">Active Session</div>
              <div className="text-[11px] text-muted-foreground">
                Sign out of your active authenticated session on this browser.
              </div>
            </div>

            <form action="/api/auth/logout" method="POST">
              <Button
                type="submit"
                variant="outline"
                size="sm"
                className="text-xs border-border hover:border-rose-500/50 hover:bg-rose-500/10 text-rose-600 dark:text-rose-400 gap-1.5 rounded-xl cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </Button>
            </form>
          </div>
        </div>
      </Card>

      {/* Integrated Account Deletion Card (Replaces standalone Danger Zone tab) */}
      <Card className="bg-card text-card-foreground border-rose-500/30 shadow-sm rounded-2xl sm:rounded-3xl">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-500" />
            <CardTitle className="text-base text-rose-600 dark:text-rose-400">Delete Account</CardTitle>
          </div>
          <CardDescription className="text-xs text-muted-foreground">
            Permanently delete your account and personal profile data.
          </CardDescription>
        </CardHeader>

        <div className="p-6 pt-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-rose-500/5 border border-rose-500/20">
            <div className="space-y-1">
              <h4 className="text-xs font-semibold text-foreground">Irreversible Action</h4>
              <p className="text-[11px] text-muted-foreground">
                Once deleted, your account cannot be recovered.
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDeleteModalOpen(true)}
              className="border-rose-500/40 hover:bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs gap-1.5 shrink-0 rounded-xl cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Account</span>
            </Button>
          </div>
        </div>
      </Card>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md transition-all"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-account-title"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isDeletingAccount) {
              setIsDeleteModalOpen(false);
              setDeleteConfirmation('');
              setDeleteError(null);
            }
          }}
        >
          <div className="w-full max-w-md rounded-2xl sm:rounded-3xl border border-rose-500/40 bg-card p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-500 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 id="delete-account-title" className="text-base font-bold text-foreground">
                  Confirm Account Deletion
                </h3>
                <p className="text-xs text-muted-foreground">
                  This action is permanent and cannot be undone.
                </p>
              </div>
            </div>

            {deleteError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-600 dark:text-rose-400">
                {deleteError}
              </div>
            )}

            <form onSubmit={handleDeleteAccount} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="block font-semibold text-foreground">
                  Reason for closure (optional)
                </label>
                <Input
                  type="text"
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  placeholder="Tell us why you are leaving..."
                  className="bg-background border-border text-xs rounded-xl text-foreground"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-semibold text-foreground">
                  Type{' '}
                  <span className="font-mono text-rose-600 dark:text-rose-400 select-all font-bold">
                    DELETE MY ACCOUNT
                  </span>{' '}
                  to confirm
                </label>
                <Input
                  type="text"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  placeholder="DELETE MY ACCOUNT"
                  required
                  className="bg-background border-border text-xs rounded-xl text-foreground font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={isDeletingAccount}
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setDeleteConfirmation('');
                    setDeleteError(null);
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground cursor-pointer rounded-xl"
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  disabled={deleteConfirmation !== 'DELETE MY ACCOUNT' || isDeletingAccount}
                  size="sm"
                  className="bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold px-4 py-2 rounded-xl gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  {isDeletingAccount ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Deleting Account...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Permanently Delete</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
