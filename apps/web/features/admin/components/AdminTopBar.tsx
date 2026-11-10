'use client';

import * as React from 'react';
import Link from 'next/link';
import { Badge } from '@elsesourav/ui';
import { ROUTES } from '@elsesourav/config';
import { ThemePopup } from '@/components/theme/ThemePopup';
import type { AdminContext } from '@elsesourav/types';
import { ExternalLink, Sparkles, Activity } from 'lucide-react';

export interface AdminTopBarProps {
  context: AdminContext;
}

export function AdminTopBar({ context }: AdminTopBarProps) {
  return (
    <header
      role="banner"
      aria-label="Admin Control Bar"
      className="hidden lg:flex items-center justify-between px-6 sm:px-8 py-3 border-b border-zinc-200 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/75 backdrop-blur-xl sticky top-0 z-30 transition-colors"
    >
      {/* Left: System Status & Environment */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[11px] font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
          <span className="font-mono uppercase tracking-wider text-[10px]">Studio Live</span>
        </div>

        <div className="h-3.5 w-px bg-zinc-200 dark:bg-zinc-800" />

        <div className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400 font-medium">
          <Activity className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          <span className="text-zinc-900 dark:text-zinc-200">ElseSourav Control Center</span>
        </div>
      </div>

      {/* Right: Quick Actions, Theme Switcher, and Operator Identity */}
      <div className="flex items-center gap-3.5">
        {/* Quick External Link to Live Public Site */}
        <Link
          href={ROUTES.HOME}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 flex items-center gap-1.5 transition-colors px-2.5 py-1.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800"
          title="Open public website in a new tab"
        >
          <ExternalLink className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
          <span>Live Site</span>
        </Link>

        {/* Vertical Divider */}
        <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800" />

        {/* Theme Changer Popup — Prominently visible in top right */}
        <div className="flex items-center gap-1.5" title="Switch Theme (Light / Dark / System)">
          <ThemePopup />
        </div>

        {/* Vertical Divider */}
        <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800" />

        {/* User Identity Pill */}
        <div className="flex items-center gap-2 pl-1">
          <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/90 border border-indigo-200 dark:border-indigo-500/30 flex items-center justify-center text-indigo-700 dark:text-indigo-300 text-xs font-bold uppercase">
            {context.displayName ? context.displayName.charAt(0) : 'A'}
          </div>
          <div className="text-left hidden xl:block">
            <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-200 leading-none">
              {context.displayName}
            </div>
            <div className="text-[10px] text-zinc-500 font-mono mt-0.5 truncate max-w-[120px]">
              {context.email}
            </div>
          </div>
          <Badge
            variant="warning"
            className="text-[9px] px-1.5 py-0 font-mono uppercase shrink-0"
          >
            {context.role}
          </Badge>
        </div>
      </div>
    </header>
  );
}
