'use client';

import * as React from 'react';
import Link from 'next/link';
import { Badge } from '@elsesourav/ui';
import { ROUTES } from '@elsesourav/config';
import { ThemePopup } from '@/components/theme/ThemePopup';
import type { AdminContext } from '@elsesourav/types';
import { Globe, Activity } from 'lucide-react';

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
      {/* Left: Branding & Control Center */}
      <div className="flex items-center gap-2.5 text-xs text-zinc-600 dark:text-zinc-400 font-medium">
        <Activity className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
        <span className="text-zinc-900 dark:text-zinc-200 font-semibold">
          ElseSourav Control Center
        </span>
      </div>

      {/* Right: Quick Actions, Theme Switcher, and Operator Identity */}
      <div className="flex items-center gap-3">
        {/* Quick Link to Live Public Site with Sleek Globe Icon */}
        <Link
          href={ROUTES.HOME}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 flex items-center gap-1.5 transition-colors px-2.5 py-1.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs"
          title="Open live public website in a new tab"
        >
          <Globe className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
          <span>Live Site</span>
        </Link>

        {/* Vertical Divider */}
        <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800" />

        {/* Theme Changer Popup */}
        <div className="flex items-center" title="Switch Theme (Light / Dark / System)">
          <ThemePopup />
        </div>

        {/* Vertical Divider */}
        <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800" />

        {/* Operator Identity (No duplicate Gmail here — shown in sidebar) */}
        <div className="flex items-center gap-2 pl-1">
          <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/90 border border-indigo-200 dark:border-indigo-500/30 flex items-center justify-center text-indigo-700 dark:text-indigo-300 text-xs font-bold uppercase">
            {context.displayName ? context.displayName.charAt(0) : 'A'}
          </div>
          <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-200 hidden xl:inline">
            {context.displayName}
          </span>
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
