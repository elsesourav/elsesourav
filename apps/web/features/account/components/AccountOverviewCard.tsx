'use client';

import StatusMark from '@/components/micro/StatusMark';
import type { User } from '@elsesourav/types';
import { ArrowRight, Calendar, KeyRound } from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';

interface AccountOverviewCardProps {
  user: User & { provider?: 'email' | 'google' | 'github' };
  joinedDate: string;
}

export function AccountOverviewCard({ user, joinedDate }: AccountOverviewCardProps) {
  const isSecurityGood = user.emailVerified;

  const authProviderLabel = React.useMemo(() => {
    if (user.provider === 'google') return 'Google Account';
    if (user.provider === 'github') return 'GitHub Account';
    return 'Email Passcode';
  }, [user.provider]);

  const roleLabel = React.useMemo(() => {
    if (user.role === 'ADMIN') return 'Administrator';
    return 'Standard Member';
  }, [user.role]);

  return (
    <div className="w-full rounded-2xl sm:rounded-3xl border border-border/80 bg-card/90 backdrop-blur-xl text-card-foreground p-5 sm:p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-border/60">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-foreground">Security Overview</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Your identity, credentials, and authentication details.
          </p>
        </div>
        <Link
          href="/settings?tab=account"
          className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline cursor-pointer"
        >
          <span>Manage</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Email Status Item */}
        <div className="p-3.5 rounded-xl border border-border/60 bg-muted/20 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-muted-foreground">Email Security</span>
            <StatusMark
              status={isSecurityGood ? 'done' : 'pending'}
              size={15}
              strokeWidth={2.4}
              doneColor="#22c55e"
            />
          </div>
          <p className="text-xs font-semibold text-foreground truncate">
            {isSecurityGood ? 'Verified' : 'Unverified'}
          </p>
          <p className="text-[11px] text-muted-foreground truncate">
            {user.email || 'No email attached'}
          </p>
        </div>

        {/* Auth Method Item */}
        <div className="p-3.5 rounded-xl border border-border/60 bg-muted/20 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-muted-foreground">Auth Method</span>
            <KeyRound className="w-3.5 h-3.5 text-muted-foreground" />
          </div>
          <p className="text-xs font-semibold text-foreground truncate">{authProviderLabel}</p>
          <p className="text-[11px] text-muted-foreground">Direct authentication</p>
        </div>

        {/* Role & Privileges Item */}
        <div className="p-3.5 rounded-xl border border-border/60 bg-muted/20 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-muted-foreground">Access Role</span>
            <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-primary/10 text-primary font-semibold">
              {user.role}
            </span>
          </div>
          <p className="text-xs font-semibold text-foreground truncate">{roleLabel}</p>
          <p className="text-[11px] text-muted-foreground">Workspace permissions</p>
        </div>

        {/* Member Longevity Item */}
        <div className="p-3.5 rounded-xl border border-border/60 bg-muted/20 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-muted-foreground">Registration</span>
            <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
          </div>
          <p className="text-xs font-semibold text-foreground truncate">{joinedDate}</p>
          <p className="text-[11px] text-muted-foreground">Active account</p>
        </div>
      </div>
    </div>
  );
}
