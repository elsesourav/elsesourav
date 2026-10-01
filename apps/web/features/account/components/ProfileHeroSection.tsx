'use client';

import * as React from 'react';
import type { User } from '@elsesourav/types';
import Link from 'next/link';
import { Mail, Calendar, Pencil } from 'lucide-react';
import { UserAvatar } from '@elsesourav/ui';
import { BlurUpImage } from '@/components/interior/BlurUpImage';
import { CopyButton } from '@/components/interior/CopyButton';
import { PressDepth } from '@/components/interior/PressDepth';
import { ShowMore } from '@/components/interior/ShowMore';

interface ProfileHeroSectionProps {
  user: User;
  joinedDate: string;
}

export function ProfileHeroSection({ user, joinedDate }: ProfileHeroSectionProps) {
  return (
    <div className="relative rounded-2xl sm:rounded-3xl border border-border/80 bg-card/90 backdrop-blur-xl text-card-foreground shadow-sm p-4 sm:p-6 md:p-7 overflow-hidden transition-all">
      <div className="pointer-events-none absolute -top-12 -right-12 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
      <div className="pointer-events-none absolute -bottom-12 -left-12 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />

      <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-5 sm:gap-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5 text-center sm:text-left w-full sm:w-auto min-w-0">
          <div className="relative shrink-0">
            {user.photoUrl ? (
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-border shadow-md bg-muted/30">
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
                className="border-2 border-border shadow-md shrink-0 w-20 h-20 sm:w-24 sm:h-24 text-2xl"
              />
            )}
          </div>

          <div className="space-y-2 flex-1 min-w-0 w-full sm:w-auto">
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-foreground leading-tight">
                {user.displayName || 'ElseSourav Member'}
              </h1>
              {user.username && (
                <div className="flex items-center justify-center sm:justify-start gap-2 mt-1">
                  <span className="text-xs sm:text-sm font-mono text-muted-foreground">
                    @{user.username}
                  </span>
                  <CopyButton
                    value={`@${user.username}`}
                    label="Copy handle"
                    copiedLabel="Copied"
                    className="h-6 px-2 text-[11px] rounded-md"
                  />
                </div>
              )}
            </div>

            {user.bio ? (
              <div className="max-w-xl pt-0.5 text-center sm:text-left">
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

            <div className="flex flex-col sm:flex-row items-center sm:items-start justify-center sm:justify-start gap-y-1.5 gap-x-5 pt-2 text-xs text-muted-foreground flex-wrap">
              {user.email && (
                <div className="flex items-center gap-1.5 max-w-full">
                  <Mail className="w-3.5 h-3.5 text-primary/80 shrink-0" />
                  <span className="truncate max-w-[200px] sm:max-w-xs">{user.email}</span>
                  <CopyButton
                    value={user.email}
                    label="Copy email"
                    copiedLabel="Copied"
                    className="h-6 px-1.5 text-[10px] rounded-md shrink-0"
                  />
                </div>
              )}
              <span className="flex items-center gap-1.5 shrink-0">
                <Calendar className="w-3.5 h-3.5 text-primary/80 shrink-0" />
                <span>Joined {joinedDate}</span>
              </span>
            </div>
          </div>
        </div>

        <div className="w-full sm:w-auto shrink-0 flex justify-center sm:justify-end sm:self-start pt-1 sm:pt-0">
          <Link href="/settings?tab=profile" className="w-full sm:w-auto">
            <PressDepth
              depth={3}
              tilt={4}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 text-xs font-semibold px-4 h-9 sm:h-9 rounded-xl border border-border bg-card hover:bg-accent hover:text-accent-foreground text-foreground shadow-sm transition-colors cursor-pointer"
            >
              <Pencil className="w-3.5 h-3.5 text-primary" />
              <span>Edit Profile</span>
            </PressDepth>
          </Link>
        </div>
      </div>
    </div>
  );
}
