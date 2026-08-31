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
    <Card className="card-obsidian-glass">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-400" />
          <CardTitle className="text-base text-zinc-100">Security & Authentication</CardTitle>
        </div>
        <CardDescription className="text-xs text-zinc-400">
          Manage credentials, email address, connected login providers, and active sessions.
        </CardDescription>
      </CardHeader>

      <div className="p-6 pt-2 space-y-6 max-w-xl">
        {/* Email Address Management */}
        <div className="p-4 rounded-2xl bg-zinc-950/40 border border-zinc-800/60 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-zinc-400" />
              <span className="text-xs font-semibold text-zinc-200">Email Address</span>
            </div>
            {isOAuth ? (
              <Badge
                variant="info"
                className="text-[10px] bg-indigo-950/60 text-indigo-300 border-indigo-500/30 gap-1 font-mono uppercase"
              >
                <Lock className="w-2.5 h-2.5" /> OAuth ({user.provider})
              </Badge>
            ) : (
              <Badge
                variant="success"
                className="text-[10px] bg-emerald-950/60 text-emerald-300 border-emerald-500/30 gap-1"
              >
                <CheckCircle2 className="w-2.5 h-2.5" /> Verified
              </Badge>
            )}
          </div>

          {isOAuth ? (
            <div className="space-y-1.5">
              <p className="text-xs text-zinc-200 font-mono bg-zinc-900/80 p-2.5 rounded-xl border border-zinc-800">
                {user.email}
              </p>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Your email is linked to your {user.provider === 'google' ? 'Google' : 'GitHub'} account and cannot be modified here.
              </p>
            </div>
          ) : (
            <form onSubmit={handleUpdateEmail} className="space-y-3 pt-1">
              {emailSuccess && (
                <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center gap-2 text-xs text-emerald-300">
                  <Check className="w-3.5 h-3.5" />
                  <span>{emailSuccess}</span>
                </div>
              )}
              {emailError && (
                <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/30 flex items-center gap-2 text-xs text-rose-300">
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
                  className="bg-zinc-950/60 border-zinc-800 text-xs rounded-xl text-zinc-100 flex-1 font-mono"
                />
                <Button
                  type="submit"
                  disabled={isUpdatingEmail || newEmail.trim() === user.email}
                  size="sm"
                  variant="outline"
                  className="border-zinc-800 text-xs text-zinc-200 hover:bg-zinc-800 rounded-xl shrink-0"
                >
                  {isUpdatingEmail ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Update Email'}
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* Password Management for Email/Password Users */}
        {!isOAuth && (
          <div className="p-4 rounded-2xl bg-zinc-950/40 border border-zinc-800/60 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-zinc-400" />
                <span className="text-xs font-semibold text-zinc-200">Update Password</span>
              </div>
              <Link
                href="/forgot-password"
                className="text-[11px] text-indigo-400 hover:text-indigo-300 hover:underline flex items-center gap-1"
              >
                <Key className="w-3 h-3" /> Forgot password?
              </Link>
            </div>

            <form onSubmit={handleUpdatePassword} className="space-y-3">
              {passwordSuccess && (
                <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center gap-2 text-xs text-emerald-300">
                  <Check className="w-3.5 h-3.5" />
                  <span>{passwordSuccess}</span>
                </div>
              )}
              {passwordError && (
                <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/30 flex items-center gap-2 text-xs text-rose-300">
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
                  className="bg-zinc-950/60 border-zinc-800 text-xs rounded-xl text-zinc-100"
                />
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="bg-zinc-950/60 border-zinc-800 text-xs rounded-xl text-zinc-100"
                />
              </div>

              <Button
                type="submit"
                disabled={isUpdatingPassword || !newPassword || !confirmPassword}
                size="sm"
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-xl gap-1.5 shadow-lg shadow-indigo-600/20"
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
        <div className="p-4 rounded-2xl bg-zinc-950/40 border border-zinc-800/60 space-y-3">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-zinc-400" />
            <span className="text-xs font-semibold text-zinc-200">Authentication Infrastructure</span>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="info" className="text-xs px-2.5 py-1">
              {isOAuth ? `${user.provider === 'google' ? 'Google' : 'GitHub'} OAuth Identity` : 'Supabase Email/Password Auth'}
            </Badge>
          </div>
          <p className="text-[11px] text-zinc-500">
            Authentication is securely managed with encrypted session cookies and token rotation.
          </p>
        </div>

        {/* Active Session Sign Out */}
        <div className="pt-2 border-t border-zinc-800/60 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-zinc-200">Sign Out of Session</div>
            <div className="text-[11px] text-zinc-400">
              Terminate your current authenticated session on this device.
            </div>
          </div>

          <form action="/api/auth/logout" method="POST">
            <Button
              type="submit"
              variant="outline"
              size="sm"
              className="text-xs border-zinc-800 hover:border-rose-500/50 hover:bg-rose-950/20 text-rose-300 gap-1.5"
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
