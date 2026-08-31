'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, Badge, Button, Input } from '@elsesourav/ui';
import type { User } from '@elsesourav/types';
import {
  UserCheck,
  Mail,
  Calendar,
  Shield,
  Lock,
  Globe,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Check,
  Loader2,
} from 'lucide-react';
import { createAuthBrowserClient } from '@elsesourav/auth';

interface AccountSectionProps {
  user: User & { provider?: 'email' | 'google' | 'github' };
}

export function AccountSection({ user }: AccountSectionProps) {
  const isOAuth = user.provider === 'google' || user.provider === 'github';

  // Email update state
  const [newEmail, setNewEmail] = React.useState(user.email || '');
  const [isUpdatingEmail, setIsUpdatingEmail] = React.useState(false);
  const [emailSuccess, setEmailSuccess] = React.useState<string | null>(null);
  const [emailError, setEmailError] = React.useState<string | null>(null);

  const formattedJoinedDate = React.useMemo(() => {
    try {
      return new Date(user.createdAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return 'August 2026';
    }
  }, [user.createdAt]);

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
          <UserCheck className="w-4 h-4 text-primary" />
          <CardTitle className="text-base text-foreground">Account Overview</CardTitle>
        </div>
        <CardDescription className="text-xs text-muted-foreground">
          View and manage your account credentials, primary email, and authentication details.
        </CardDescription>
      </CardHeader>

      <div className="p-6 pt-2 space-y-6 max-w-xl">
        {/* Email Address Management */}
        <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-primary" />
              <span className="text-xs font-semibold text-foreground">Primary Email</span>
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

        {/* Account Details & Role */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
              <Shield className="w-4 h-4 text-primary" />
              <span>Account Role</span>
            </div>
            <p className="text-xs font-mono text-muted-foreground pt-1">
              {user.role === 'ADMIN' ? (
                <span className="font-semibold text-amber-600 dark:text-amber-300">Administrator</span>
              ) : (
                <span>Standard Member</span>
              )}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
              <Calendar className="w-4 h-4 text-primary" />
              <span>Member Since</span>
            </div>
            <p className="text-xs text-muted-foreground pt-1">{formattedJoinedDate}</p>
          </div>
        </div>

        {/* Authentication Infrastructure */}
        <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-3">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-primary" />
            <span className="text-xs font-semibold text-foreground">Authentication Infrastructure</span>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="info" className="text-xs px-2.5 py-1">
              {isOAuth ? `${user.provider === 'google' ? 'Google' : 'GitHub'} OAuth Identity` : 'Supabase Email & Password'}
            </Badge>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Account sessions are protected using secure HTTP-only cookies and cryptographic token validation.
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
