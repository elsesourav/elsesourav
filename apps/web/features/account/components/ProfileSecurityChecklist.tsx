'use client';

import * as React from 'react';
import type { User } from '@elsesourav/types';
import Link from 'next/link';
import { Mail, AtSign, Image as ImageIcon, FileText, ArrowUpRight } from 'lucide-react';
import StatusMark from '@/components/micro/StatusMark';
import { ProgressBar } from '@/components/interior/ProgressBar';

interface ProfileSecurityChecklistProps {
  user: User;
}

export function ProfileSecurityChecklist({ user }: ProfileSecurityChecklistProps) {
  const items = React.useMemo(() => {
    return [
      {
        id: 'email',
        title: 'Email Verification',
        description: user.emailVerified
          ? 'Primary email verified and secure'
          : 'Verify your email to secure account recovery',
        completed: Boolean(user.emailVerified),
        icon: Mail,
        actionHref: '/settings?tab=account',
        actionLabel: user.emailVerified ? 'Manage' : 'Verify now',
      },
      {
        id: 'username',
        title: 'Public Handle',
        description: user.username
          ? `@${user.username} claimed`
          : 'Claim a unique @username for your public profile',
        completed: Boolean(user.username),
        icon: AtSign,
        actionHref: '/settings?tab=profile',
        actionLabel: user.username ? 'Edit' : 'Claim handle',
      },
      {
        id: 'avatar',
        title: 'Profile Photo',
        description: user.photoUrl
          ? 'Custom avatar uploaded'
          : 'Upload an avatar to personalize your account',
        completed: Boolean(user.photoUrl),
        icon: ImageIcon,
        actionHref: '/settings?tab=profile',
        actionLabel: user.photoUrl ? 'Change' : 'Upload photo',
      },
      {
        id: 'bio',
        title: 'Bio & Bio Information',
        description: user.bio
          ? 'Short description configured'
          : 'Write a few words about what you are building',
        completed: Boolean(user.bio?.trim()),
        icon: FileText,
        actionHref: '/settings?tab=profile',
        actionLabel: user.bio ? 'Update' : 'Add bio',
      },
    ];
  }, [user]);

  const completedCount = items.filter((i) => i.completed).length;
  const progressPercent = Math.round((completedCount / items.length) * 100);

  return (
    <div className="w-full rounded-2xl border border-border/80 bg-card text-card-foreground p-4 sm:p-6 shadow-sm space-y-5">
      {/* Header and Progress Bar */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold tracking-tight text-foreground">
              Profile & Security Readiness
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Complete key milestones to maximize account security and visibility.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
              {completedCount} of {items.length} completed
            </span>
          </div>
        </div>

        <ProgressBar
          value={progressPercent}
          max={100}
          label="Profile Completeness"
          completeLabel="All Done"
          className="pt-1"
        />
      </div>

      {/* Checklist Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 sm:p-3.5 rounded-xl border border-border/60 bg-muted/20 hover:bg-muted/40 transition-colors gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="shrink-0 flex items-center justify-center">
                  <StatusMark
                    status={item.completed ? 'done' : 'pending'}
                    size={20}
                    strokeWidth={2}
                    doneColor="#22c55e"
                  />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <Icon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <span className="text-xs font-semibold text-foreground truncate">
                      {item.title}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground truncate max-w-[200px] sm:max-w-xs mt-0.5">
                    {item.description}
                  </p>
                </div>
              </div>

              <Link
                href={item.actionHref}
                className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-lg text-primary hover:bg-primary/10 border border-transparent hover:border-primary/20 transition-all cursor-pointer"
              >
                <span>{item.actionLabel}</span>
                <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
