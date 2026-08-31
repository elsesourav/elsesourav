'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, Badge, Button, Input } from '@elsesourav/ui';
import type { User } from '@elsesourav/types';
import {
  Shield,
  Key,
  Mail,
  CheckCircle2,
  Lock,
  LogOut,
  Globe,
  AlertCircle,
  Loader2,
  Check,
} from 'lucide-react';
import { createAuthBrowserClient } from '@elsesourav/auth';

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

  // Email update state
  const [newEmail, setNewEmail] = React.useState(user.email || '');
  const [isUpdatingEmail, setIsUpdatingEmail] = React.useState(false);
  const [emailSuccess, setEmailSuccess] = React.useState<string | null>(null);
  const [emailError, setEmailError] = React.useState<string | null>(null);

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

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailSuccess(null);
    setEmailError(null);

    const trimmed = newEmail.trim().toLowerCase();
    if (!trimmed || !trimmed.includes('@')) {
      setEmailError('Please enter a valid email address');
      return;
    }

    if (trimmed === user.email.toLowerCase()) {
      setEmailSuccess('Email address is already current.');
      return;
    }

    try {
      setIsUpdatingEmail(true);
      const supabase = createAuthBrowserClient();
      const { error } = await supabase.auth.updateUser({ email: trimmed });

      if (error) {
        setEmailError(error.message);
      } else {
        setEmailSuccess('A verification link has been sent to your new email address.');
      }
    } catch {
      setEmailError('An unexpected error occurred while updating your email.');
    } finally {
      setIsUpdatingEmail(false);
    }
  };

  return (
    <Card className="bg-card text-card-foreground border-border shadow-sm rounded-2xl sm:rounded-3xl">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-500" />
          <CardTitle className="text-base text-foreground">Password & Security</CardTitle>
        </div>
        <CardDescription className="text-xs text-muted-foreground">
          Manage your login credentials, connected authentication provider, and active session.
        </CardDescription>
      </CardHeader>

      <div className="p-6 pt-2 space-y-6 max-w-xl">
        {/* Email Address Management */}
        <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-primary" />
              <span className="text-xs font-semibold text-foreground">Email Address</span>
            </div>
            {isOAuth ? (
              <Badge
                variant="info"
                className="text-[10px] bg-primary/10 text-primary border-primary/30 gap-1 font-mono uppercase"
              >
                <Lock className="w-2.5 h-2.5" /> OAuth ({user.provider})
              </Badge>
            ) : (
              <Badge
                variant="success"
                className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 gap-1"
              >
                <CheckCircle2 className="w-2.5 h-2.5" /> Verified
              </Badge>
            )}
          </div>

          {isOAuth ? (
            <div className="space-y-1.5">
              <p className="text-xs text-foreground font-mono bg-background p-2.5 rounded-xl border border-border">
                {user.email}
              </p>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Your email is linked to your {user.provider === 'google' ? 'Google' : 'GitHub'} account and cannot be modified directly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleUpdateEmail} className="space-y-3 pt-1">
              {emailSuccess && (
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400">
                  <Check className="w-3.5 h-3.5" />
                  <span>{emailSuccess}</span>
                </div>
              )}
              {emailError && (
                <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2 text-xs text-rose-600 dark:text-rose-400">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{emailError}</span>
                </div>
              )}
              <div className="flex gap-2">
                <Input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="bg-background border-border text-xs rounded-xl text-foreground flex-1 font-mono"
                />
                <Button
                  type="submit"
                  disabled={isUpdatingEmail || newEmail.trim() === user.email}
                  size="sm"
                  variant="outline"
                  className="border-border text-xs text-foreground hover:bg-accent rounded-xl shrink-0"
                >
                  {isUpdatingEmail ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Update Email'}
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* Password Management for Email/Password Users */}
        {!isOAuth && (
          <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-primary" />
                <span className="text-xs font-semibold text-foreground">Update Password</span>
              </div>
              <Link
                href="/forgot-password"
                className="text-[11px] text-primary hover:underline flex items-center gap-1"
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
        )}

        {/* Connected Auth Providers */}
        <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-3">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-primary" />
            <span className="text-xs font-semibold text-foreground">Authentication Infrastructure</span>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="info" className="text-xs px-2.5 py-1">
              {isOAuth ? `${user.provider === 'google' ? 'Google' : 'GitHub'} OAuth Identity` : 'Supabase Email/Password Auth'}
            </Badge>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Authentication is securely managed with encrypted HTTP-only session cookies and token rotation.
          </p>
        </div>

        {/* Active Session Sign Out */}
        <div className="pt-2 border-t border-border flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-foreground">Sign Out of Session</div>
            <div className="text-[11px] text-muted-foreground">
              Terminate your active authenticated session on this device.
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
  );
}
