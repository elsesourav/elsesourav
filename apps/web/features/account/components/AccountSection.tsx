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
      <Card className="bg-card text-card-foreground border-border/50 sm:border-border shadow-xs sm:shadow-sm rounded-xl sm:rounded-2xl md:rounded-3xl overflow-hidden transition-all">
        <CardHeader className="pb-2 sm:pb-2.5 md:pb-3 px-3 sm:px-5 pt-3 sm:pt-4 md:pt-5 border-b border-border/40 sm:border-border/60">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
              <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div>
              <CardTitle className="text-xs sm:text-sm md:text-base font-bold text-foreground">
                Security
              </CardTitle>
              <CardDescription className="text-[10px] sm:text-[11px] md:text-xs text-muted-foreground mt-0.5">
                Manage your credentials, password reset flow, and session security.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <div className="p-2.5 sm:p-4 md:p-5 pt-2 sm:pt-3 space-y-2 sm:space-y-3 md:space-y-3.5">
          <AccountEmailCard
            email={user.email}
            initialVerified={user.emailVerified}
            isOAuth={isOAuth}
            provider={user.provider}
          />

          {!isOAuth && <AccountPasswordCard email={user.email} />}

          {isOAuth && (
            <div className="p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-muted/15 border border-border/50 flex items-center gap-2 text-[11px] sm:text-xs text-muted-foreground">
              <Lock className="w-3.5 h-3.5 text-primary shrink-0" />
              <span>
                Signed in with {user.provider === 'google' ? 'Google' : 'GitHub'} OAuth. Credentials
                are managed by your provider.
              </span>
            </div>
          )}

          <div
            data-section="security-membership"
            className="p-2.5 sm:p-3.5 md:p-4 rounded-lg sm:rounded-xl md:rounded-2xl bg-muted/15 border border-border/50 sm:border-border/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 sm:gap-3 transition-colors"
          >
            <div className="flex items-center gap-3 sm:gap-4 text-[11px] sm:text-xs text-muted-foreground flex-wrap">
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
              ripple
              onClick={() => setShowSignOutModal(true)}
              leftIcon={<LogOut className="w-3 h-3" />}
              className="text-[10px] sm:text-xs border-border/70 hover:border-rose-500/50 hover:bg-rose-500/10 text-rose-400 rounded-md sm:rounded-lg cursor-pointer h-6.5 sm:h-7 px-2.5 sm:px-3 shrink-0"
            >
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
