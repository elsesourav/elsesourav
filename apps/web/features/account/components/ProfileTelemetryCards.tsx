'use client';

import * as React from 'react';
import type { User } from '@elsesourav/types';
import { ShieldCheck, ShieldAlert, KeyRound, Award, Calendar } from 'lucide-react';
import StatusMark from '@/components/micro/StatusMark';
import { PressDepth } from '@/components/interior/PressDepth';

interface ProfileTelemetryCardsProps {
  user: User & { provider?: 'email' | 'google' | 'github' };
  joinedDate: string;
}

export function ProfileTelemetryCards({ user, joinedDate }: ProfileTelemetryCardsProps) {
  const isSecurityGood = user.emailVerified;
  const authProviderLabel = React.useMemo(() => {
    if (user.provider === 'google') return 'Google OAuth';
    if (user.provider === 'github') return 'GitHub OAuth';
    return 'Email Passcode';
  }, [user.provider]);

  const roleLabel = React.useMemo(() => {
    if (user.role === 'ADMIN') return 'Administrator';
    return 'Standard Member';
  }, [user.role]);

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Telemetry & Account Overview
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-3.5">
        {/* 1. Account Security Health Card */}
        <PressDepth
          depth={2}
          tilt={2}
          className="w-full h-full p-4 rounded-2xl bg-card text-card-foreground border border-border/80 shadow-sm hover:border-primary/30 transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-medium text-muted-foreground">Security Health</span>
            <div className="flex items-center gap-1.5">
              <StatusMark
                status={isSecurityGood ? 'done' : 'pending'}
                size={16}
                strokeWidth={2.2}
                doneColor="#22c55e"
              />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <div
                className={`p-1.5 rounded-lg border text-xs ${
                  isSecurityGood
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                }`}
              >
                {isSecurityGood ? (
                  <ShieldCheck className="w-3.5 h-3.5" />
                ) : (
                  <ShieldAlert className="w-3.5 h-3.5" />
                )}
              </div>
              <span className="text-base font-bold tracking-tight text-foreground">
                {isSecurityGood ? 'Protected' : 'Attention'}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1.5">
              {isSecurityGood ? 'Email verified & secure' : 'Verification pending'}
            </p>
          </div>
        </PressDepth>

        {/* 2. Platform Access Role */}
        <PressDepth
          depth={2}
          tilt={2}
          className="w-full h-full p-4 rounded-2xl bg-card text-card-foreground border border-border/80 shadow-sm hover:border-primary/30 transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-medium text-muted-foreground">Membership Tier</span>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20 font-semibold">
              {user.role}
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg border bg-primary/10 text-primary border-primary/20">
                <Award className="w-3.5 h-3.5" />
              </div>
              <span className="text-base font-bold tracking-tight text-foreground truncate">
                {roleLabel}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1.5">Full workspace privileges</p>
          </div>
        </PressDepth>

        {/* 3. Authentication Provider */}
        <PressDepth
          depth={2}
          tilt={2}
          className="w-full h-full p-4 rounded-2xl bg-card text-card-foreground border border-border/80 shadow-sm hover:border-primary/30 transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-medium text-muted-foreground">Auth Method</span>
            <div className="p-1 rounded-md bg-muted/60 text-muted-foreground">
              <KeyRound className="w-3 h-3" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-tight text-foreground truncate">
                {authProviderLabel}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1.5">Single-factor or social login</p>
          </div>
        </PressDepth>

        {/* 4. Longevity & Joined Date */}
        <PressDepth
          depth={2}
          tilt={2}
          className="w-full h-full p-4 rounded-2xl bg-card text-card-foreground border border-border/80 shadow-sm hover:border-primary/30 transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-medium text-muted-foreground">Member Since</span>
            <div className="p-1 rounded-md bg-muted/60 text-muted-foreground">
              <Calendar className="w-3 h-3" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-tight text-foreground truncate">
                {joinedDate}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1.5">Active account tenure</p>
          </div>
        </PressDepth>
      </div>
    </div>
  );
}
