'use client';

import * as React from 'react';
import type { User } from '@elsesourav/types';
import Link from 'next/link';
import { Mail, Calendar, Pencil } from 'lucide-react';
import { Button, UserAvatar } from '@elsesourav/ui';

interface ProfileHeroSectionProps {
  user: User;
  joinedDate: string;
}

export function ProfileHeroSection({ user, joinedDate }: ProfileHeroSectionProps) {
  return (
    <div className="relative rounded-2xl sm:rounded-3xl border border-border/80 bg-card text-card-foreground shadow-sm p-5 sm:p-7 md:p-8 overflow-hidden transition-all">
      {/* Subtle atmospheric ambient lighting */}
      <div className="pointer-events-none absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />

      <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-5 sm:gap-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 text-center sm:text-left w-full sm:w-auto">
          {/* Avatar */}
          <UserAvatar
            src={user.photoUrl}
            name={user.displayName}
            identifier={user.id || user.email}
            alt={user.displayName || 'Profile avatar'}
            size="xl"
            className="border-2 border-border shadow-md"
          />

          {/* Identity Information */}
          <div className="space-y-1.5 sm:space-y-2 flex-1 min-w-0">
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                {user.displayName || 'ElseSourav Member'}
              </h1>
              {user.username && (
                <p className="text-xs sm:text-sm font-mono text-muted-foreground mt-0.5">
                  @{user.username}
                </p>
              )}
            </div>

            {/* User Bio (rendered only if present) */}
            {user.bio ? (
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-xl pt-0.5">
                {user.bio}
              </p>
            ) : null}

            {/* Secondary Metadata: Email & Joined Date */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-y-1 gap-x-4 pt-1.5 text-xs text-muted-foreground">
              {user.email && (
                <span className="flex items-center gap-1.5 max-w-full truncate">
                  <Mail className="w-3.5 h-3.5 text-primary/70 shrink-0" />
                  <span className="truncate">{user.email}</span>
                </span>
              )}
              <span className="flex items-center gap-1.5 shrink-0">
                <Calendar className="w-3.5 h-3.5 text-primary/70 shrink-0" />
                <span>Joined {joinedDate}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="w-full sm:w-auto shrink-0 flex justify-center sm:justify-end sm:self-start pt-1 sm:pt-0">
          <Link href="/settings?tab=profile" className="w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              className="w-full sm:w-auto text-xs gap-1.5 rounded-xl border-border hover:bg-accent hover:text-accent-foreground shadow-sm transition-all"
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
