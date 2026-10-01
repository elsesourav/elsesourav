'use client';

import * as React from 'react';
import type { User } from '@elsesourav/types';
import { Card, CardDescription, CardHeader, CardTitle, Button } from '@elsesourav/ui';
import { Shield, ShieldCheck, Calendar, LogOut, Lock } from 'lucide-react';
import { AccountEmailCard } from './AccountEmailCard';
import { AccountPasswordCard } from './AccountPasswordCard';
import { AccountDeleteCard } from './AccountDeleteCard';

interface AccountSectionProps {
  user: User & { provider?: 'email' | 'google' | 'github' };
}

export function AccountSection({ user }: AccountSectionProps) {
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
                Account &amp; Security
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

            <form action="/api/auth/logout" method="POST" className="shrink-0">
              <Button
                type="submit"
                variant="outline"
                size="sm"
                className="text-xs border-border hover:border-rose-500/50 hover:bg-rose-500/10 text-rose-400 gap-1.5 rounded-lg cursor-pointer h-7 px-3"
              >
                <LogOut className="w-3 h-3" />
                <span>Sign Out</span>
              </Button>
            </form>
          </div>

          <AccountDeleteCard
            targetUsername={targetUsername}
            scheduledDeletionAt={user.scheduledDeletionAt}
          />
        </div>
      </Card>
    </div>
  );
}
