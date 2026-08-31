'use client';

import * as React from 'react';
import type { User } from '@elsesourav/types';
import { CheckCircle } from 'lucide-react';

interface ProfileHeroSectionProps {
  user: User;
}

export function ProfileHeroSection({ user }: ProfileHeroSectionProps) {
  return (
    <div className="card-obsidian-glass p-6 sm:p-8 lg:p-10 relative overflow-hidden">
      {/* Ambient Glow Orbs */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-56 h-56 bg-purple-500/8 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8 relative z-10">
        {/* Concentric Neon Avatar */}
        <div className="flex flex-col items-center gap-3 shrink-0">
          <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full avatar-neon-concentric overflow-hidden bg-zinc-900 flex items-center justify-center">
            {user.photoUrl ? (
              <img
                src={user.photoUrl}
                alt={user.displayName || 'Avatar'}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-3xl sm:text-4xl font-bold text-indigo-400">
                {user.displayName?.slice(0, 2).toUpperCase() || 'U'}
              </span>
            )}
          </div>
          {/* Verified Member Pill */}
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-950/80 border border-sky-500/40 text-sky-300 text-xs font-medium shadow-[0_0_15px_rgba(6,182,212,0.25)]">
            <CheckCircle className="w-3.5 h-3.5 text-sky-400" />
            <span>Verified Member</span>
          </span>
        </div>

        {/* Identity Typography */}
        <div className="space-y-3 text-center md:text-left flex-1 min-w-0">
          <div className="space-y-1">
            <p className="text-xs text-indigo-400/90 font-mono tracking-wider uppercase font-semibold">
              Display Name
            </p>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white text-neon-headline tracking-tight">
              {user.displayName || 'ElseSourav Member'}
            </h1>
          </div>

          {/* Badges Row */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-1">
            {user.username && (
              <span className="text-xs font-mono text-indigo-300 bg-indigo-500/15 border border-indigo-500/30 px-2.5 py-1 rounded-lg">
                @{user.username}
              </span>
            )}
            <span
              className={`text-[11px] font-mono px-2.5 py-0.5 rounded-md font-medium ${
                user.role === 'ADMIN'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-zinc-800/80 text-zinc-300 border border-zinc-700/60'
              }`}
            >
              {user.role}
            </span>
            {user.status === 'active' && (
              <span className="text-xs font-medium text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-1 rounded-lg flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Active
              </span>
            )}
          </div>

          {/* Bio */}
          {user.bio ? (
            <p className="text-xs sm:text-sm text-zinc-300 pt-1 leading-relaxed max-w-xl">
              {user.bio}
            </p>
          ) : (
            <p className="text-xs text-zinc-500 italic pt-1">
              No bio added yet. Click &quot;Edit Profile&quot; to add one.
            </p>
          )}

          {/* Email subtitle */}
          <p className="text-[11px] text-zinc-500 font-mono">{user.email}</p>
        </div>
      </div>
    </div>
  );
}
