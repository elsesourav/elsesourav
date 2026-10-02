'use client';

import * as React from 'react';
import type { User } from '@elsesourav/types';
import Link from 'next/link';
import { Mail, Calendar, Pencil } from 'lucide-react';
import { UserAvatar, Button } from '@elsesourav/ui';
import { BlurUpImage } from '@/components/interior/BlurUpImage';
import { ShowMore } from '@/components/interior/ShowMore';
import CopyIconButton from '@/components/micro/CopyIconButton';
import StatusMark from '@/components/micro/StatusMark';

interface ProfileHeroSectionProps {
  user: User;
  joinedDate: string;
}

export function ProfileHeroSection({ user, joinedDate }: ProfileHeroSectionProps) {
  const roleLabel = user.role === 'ADMIN' ? 'Admin' : 'Member';

  return (
    <div className="relative rounded-2xl sm:rounded-3xl border border-border/80 bg-card/90 backdrop-blur-xl text-card-foreground shadow-sm p-4 sm:p-6 md:p-7 overflow-hidden transition-all">
      <div className="pointer-events-none absolute -top-12 -right-12 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
      <div className="pointer-events-none absolute -bottom-12 -left-12 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />

      <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-5 sm:gap-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5 text-center sm:text-left w-full sm:w-auto min-w-0">
          <div className="relative shrink-0">
            {user.photoUrl ? (
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-border/80 shadow-sm bg-muted/30">
                <BlurUpImage
                  src={user.photoUrl}
                  alt={user.displayName || 'Profile avatar'}
                  width={96}
                  height={96}
                  radius={9999}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <UserAvatar
                src={null}
                name={user.displayName}
                identifier={user.id || user.email}
                alt={user.displayName || 'Profile avatar'}
                size="lg"
                className="border-2 border-border/80 shadow-sm shrink-0 w-20 h-20 sm:w-24 sm:h-24 text-2xl"
              />
            )}
            <div
              className="absolute bottom-0 right-0 bg-background rounded-full p-0.5 shadow-sm border border-border flex items-center justify-center"
              title={user.emailVerified ? 'Account Verified' : 'Verification Pending'}
            >
              <StatusMark
                status={user.emailVerified ? 'done' : 'pending'}
                size={16}
                strokeWidth={2.4}
                doneColor="#22c55e"
              />
            </div>
          </div>

          <div className="space-y-1.5 flex-1 min-w-0 w-full sm:w-auto">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-foreground leading-tight">
                {user.displayName || 'ElseSourav Member'}
              </h1>
              <span className="self-center sm:self-auto text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                {roleLabel}
              </span>
            </div>

            {user.username && (
              <div className="flex items-center justify-center sm:justify-start gap-1">
                <span className="text-xs sm:text-sm font-mono text-muted-foreground">
                  @{user.username}
                </span>
                <CopyIconButton value={`@${user.username}`} label="Copy username" size="xs" />
              </div>
            )}

            {user.bio ? (
              <div className="max-w-xl pt-1 text-center sm:text-left">
                <ShowMore
                  lines={2}
                  moreLabel="More"
                  lessLabel="Less"
                  className="text-xs sm:text-sm text-muted-foreground leading-relaxed"
                >
                  <p>{user.bio}</p>
                </ShowMore>
              </div>
            ) : null}

            <div className="flex flex-col sm:flex-row items-center sm:items-start justify-center sm:justify-start gap-2 sm:gap-x-5 pt-2 text-xs text-muted-foreground flex-wrap">
              {user.email && (
                <div className="inline-flex items-center gap-1 max-w-full">
                  <Mail className="w-3.5 h-3.5 text-primary/80 shrink-0" />
                  <span className="truncate max-w-[200px] sm:max-w-xs">{user.email}</span>
                  <CopyIconButton value={user.email} label="Copy email" size="xs" />
                </div>
              )}
              <span className="inline-flex items-center gap-1.5 shrink-0">
                <Calendar className="w-3.5 h-3.5 text-primary/80 shrink-0" />
                <span>Joined {joinedDate}</span>
              </span>
            </div>
          </div>
        </div>

        <div className="w-full sm:w-auto shrink-0 flex justify-center sm:justify-end sm:self-start pt-1 sm:pt-0">
          <Link href="/settings?tab=profile" className="w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              className="w-full sm:w-auto gap-1.5 rounded-xl border-border hover:border-primary/40 text-xs font-semibold px-4 h-9 shadow-xs"
            >
              <Pencil className="w-3.5 h-3.5 text-primary" />
              <span>Edit Profile</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
