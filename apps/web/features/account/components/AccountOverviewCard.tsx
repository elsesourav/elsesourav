'use client';

import StatusMark from '@/components/micro/StatusMark';
import type { User } from '@elsesourav/types';
import { Button } from '@elsesourav/ui';
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
    <div
      data-section="profile-overview"
      className="w-full rounded-xl sm:rounded-2xl md:rounded-3xl border border-border/50 sm:border-border/80 bg-card/90 backdrop-blur-xl text-card-foreground p-3 sm:p-4 md:p-5 shadow-xs sm:shadow-sm space-y-3 sm:space-y-4"
    >
      <div className="flex items-center justify-between pb-2.5 sm:pb-3 border-b border-border/50 sm:border-border/60">
        <div>
          <h2 className="text-xs sm:text-sm md:text-base font-bold text-foreground">
            Security Overview
          </h2>
          <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">
            Your identity, credentials, and authentication details.
          </p>
        </div>
        <Link href="/account?tab=security" className="shrink-0">
          <Button
            type="button"
            variant="ghost"
            size="xs"
            ripple
            rightIcon={<ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
            className="text-[11px] sm:text-xs font-semibold text-primary hover:text-primary hover:bg-primary/10 rounded-lg h-6.5 sm:h-7 px-2 sm:px-2.5 cursor-pointer"
          >
            Manage
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5 md:gap-4">
        {/* Email Status Item */}
        <div className="p-2.5 sm:p-3.5 rounded-lg sm:rounded-xl border border-border/50 sm:border-border/60 bg-muted/15 space-y-0.5 sm:space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-medium text-muted-foreground">
              Email Security
            </span>
            <StatusMark
              status={isSecurityGood ? 'done' : 'pending'}
              size={14}
              strokeWidth={2.4}
              doneColor="#22c55e"
            />
          </div>
          <p className="text-[11px] sm:text-xs md:text-sm font-semibold text-foreground truncate">
            {isSecurityGood ? 'Verified' : 'Unverified'}
          </p>
          <p className="text-[10px] sm:text-[11px] text-muted-foreground truncate">
            {user.email || 'No email attached'}
          </p>
        </div>

        {/* Auth Method Item */}
        <div className="p-2.5 sm:p-3.5 rounded-lg sm:rounded-xl border border-border/50 sm:border-border/60 bg-muted/15 space-y-0.5 sm:space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-medium text-muted-foreground">
              Auth Method
            </span>
            <KeyRound className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-muted-foreground" />
          </div>
          <p className="text-[11px] sm:text-xs md:text-sm font-semibold text-foreground truncate">
            {authProviderLabel}
          </p>
          <p className="text-[10px] sm:text-[11px] text-muted-foreground">
            Direct authentication
          </p>
        </div>

        {/* Role & Privileges Item */}
        <div className="p-2.5 sm:p-3.5 rounded-lg sm:rounded-xl border border-border/50 sm:border-border/60 bg-muted/15 space-y-0.5 sm:space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-medium text-muted-foreground">
              Access Role
            </span>
            <span className="text-[8px] sm:text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-primary/10 text-primary font-semibold">
              {user.role}
            </span>
          </div>
          <p className="text-[11px] sm:text-xs md:text-sm font-semibold text-foreground truncate">
            {roleLabel}
          </p>
          <p className="text-[10px] sm:text-[11px] text-muted-foreground">
            Workspace permissions
          </p>
        </div>

        {/* Member Longevity Item */}
        <div className="p-2.5 sm:p-3.5 rounded-lg sm:rounded-xl border border-border/50 sm:border-border/60 bg-muted/15 space-y-0.5 sm:space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-medium text-muted-foreground">
              Registration
            </span>
            <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-muted-foreground" />
          </div>
          <p className="text-[11px] sm:text-xs md:text-sm font-semibold text-foreground truncate">
            {joinedDate}
          </p>
          <p className="text-[10px] sm:text-[11px] text-muted-foreground">Active account</p>
        </div>
      </div>
    </div>
  );
}
