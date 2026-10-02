'use client';

import * as React from 'react';
import type { User } from '@elsesourav/types';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@elsesourav/ui';
import { Shield, ShieldCheck, Calendar, LogOut, Lock } from 'lucide-react';
import { AccountEmailCard } from './AccountEmailCard';
import { AccountPasswordCard } from './AccountPasswordCard';
import { AccountDeleteCard } from './AccountDeleteCard';

interface AccountSectionProps {
  user: User & { provider?: 'email' | 'google' | 'github' };
}

export function AccountSection({ user }: AccountSectionProps) {
  const [showSignOutModal, setShowSignOutModal] = React.useState(false);
  const isOAuth = user.provider === 'google' || user.provider === 'github';

  const targetUsername = user.username || user.email.split('@')[0] || 'user';

  const formattedJoinedDate = React.useMemo(() => {
    try {
      return new Date(user.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return 'Aug 2026';
    }
  }, [user.createdAt]);

  return (
    <div className="w-full">
      <Card className="bg-card text-card-foreground border-border shadow-sm rounded-2xl sm:rounded-3xl overflow-hidden">
        <CardHeader className="pb-3 sm:pb-4 border-b border-border/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <CardTitle className="text-sm sm:text-base font-bold text-foreground">
                Security
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Manage your credentials, password reset flow, and session security.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <div className="p-4 sm:p-5 space-y-3.5">
          <AccountEmailCard
            email={user.email}
            initialVerified={user.emailVerified}
            isOAuth={isOAuth}
            provider={user.provider}
          />

          {!isOAuth && <AccountPasswordCard email={user.email} />}

          {isOAuth && (
            <div className="p-3.5 rounded-xl bg-muted/20 border border-border/80 flex items-center gap-2 text-xs text-muted-foreground">
              <Lock className="w-4 h-4 text-primary shrink-0" />
              <span>
                Signed in with {user.provider === 'google' ? 'Google' : 'GitHub'} OAuth. Credentials
                are managed by your provider.
              </span>
            </div>
          )}

          <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-muted/20 border border-border/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-colors">
            <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
              <div className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-primary shrink-0" />
                <span className="font-semibold text-foreground">
                  {user.role === 'ADMIN' ? 'Administrator' : 'Standard Member'}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
                <span>Joined {formattedJoinedDate}</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowSignOutModal(true)}
              className="text-xs border-border hover:border-rose-500/50 hover:bg-rose-500/10 text-rose-400 gap-1.5 rounded-lg cursor-pointer h-7 px-3 shrink-0"
            >
              <LogOut className="w-3 h-3" />
              <span>Sign Out</span>
            </Button>
          </div>

          <AccountDeleteCard
            targetUsername={targetUsername}
            scheduledDeletionAt={user.scheduledDeletionAt}
          />
        </div>
      </Card>

      {/* Accessible Logout Confirmation Dialog */}
      <Dialog open={showSignOutModal} onOpenChange={setShowSignOutModal}>
        <DialogContent onClose={() => setShowSignOutModal(false)} className="sm:max-w-md">
          <DialogHeader>
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 mb-2">
              <LogOut className="w-5 h-5" />
            </div>
            <DialogTitle>Sign out of ElseSourav?</DialogTitle>
            <DialogDescription>
              Are you sure you want to end your active session? You will need to sign in again to
              access your account and security settings.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowSignOutModal(false)}
              className="w-full sm:w-auto rounded-xl text-xs font-semibold cursor-pointer"
            >
              Cancel
            </Button>
            <form action="/api/auth/logout" method="POST" className="w-full sm:w-auto">
              <Button
                type="submit"
                variant="danger"
                className="w-full sm:w-auto rounded-xl text-xs font-semibold gap-1.5 cursor-pointer shadow-sm"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Confirm Sign Out</span>
              </Button>
            </form>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
