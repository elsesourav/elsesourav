'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { Search } from 'lucide-react';
import { SearchOverlay } from './SearchOverlay';
import { AnimatedSearchPlaceholder } from './AnimatedSearchPlaceholder';

export interface SearchButtonProps {
  className?: string;
}

export function SearchButton({ className = '' }: SearchButtonProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const isAppsSection = pathname.startsWith('/apps');
  const isUpdatesSection = pathname.startsWith('/updates');
  const isAccountSection =
    pathname.startsWith('/profile') ||
    pathname.startsWith('/settings') ||
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/library') ||
    pathname.startsWith('/notifications') ||
    pathname.startsWith('/account') ||
    pathname.startsWith('/support');

  // Global Cmd+K / Ctrl+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger when typing in inputs/textareas
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      if (
        ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') ||
        (!e.metaKey && !e.ctrlKey && !e.altKey && e.key === '/')
      ) {
        e.preventDefault();
        setOpen((prev) => {
          if (prev) {
            // Restore focus to button without auto-scrolling the page
            setTimeout(() => {
              buttonRef.current?.focus({ preventScroll: true });
            }, 50);
            return false;
          }
          return true;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
    // Restore focus to the search button strictly without scrolling the window
    setTimeout(() => {
      buttonRef.current?.focus({ preventScroll: true });
    }, 50);
  }, []);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen(true)}
        className={`flex items-center justify-between gap-2 h-9 px-3 py-1.5 w-full rounded-full border border-black/10 dark:border-white/10 bg-black/[0.04] dark:bg-white/[0.06] backdrop-blur-[6px] hover:bg-black/[0.07] dark:hover:bg-white/[0.1] hover:border-black/20 dark:hover:border-white/20 text-[hsl(var(--foreground))]/80 hover:text-[hsl(var(--foreground))] active:scale-[0.98] transition-all duration-150 ease-smooth focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] cursor-pointer group whitespace-nowrap shadow-2xs ${className}`}
        aria-label={
          isAccountSection
            ? 'Search in Account'
            : isAppsSection
              ? 'Search in Apps'
              : isUpdatesSection
                ? 'Search in Updates'
                : 'Search apps, updates, and projects'
        }
      >
        <div className="flex items-center gap-2 min-w-0 overflow-hidden flex-1">
          <Search className="w-3.5 h-3.5 shrink-0 text-[hsl(var(--foreground))]/70 group-hover:text-[hsl(var(--foreground))] transition-colors" />

          {/* Section Indicator Text: normal neutral text matching other pages */}
          {isAccountSection && (
            <span className="hidden sm:inline text-xs font-normal text-[hsl(var(--foreground))]/90 shrink-0 select-none">
              Account &gt;
            </span>
          )}

          {isAppsSection && (
            <span className="hidden sm:inline text-xs font-normal text-[hsl(var(--foreground))]/90 shrink-0 select-none">
              Apps &gt;
            </span>
          )}

          {isUpdatesSection && (
            <span className="hidden sm:inline text-xs font-normal text-[hsl(var(--foreground))]/90 shrink-0 select-none">
              Updates &gt;
            </span>
          )}

          <AnimatedSearchPlaceholder
            prefix="Search "
            words={
              isAccountSection
                ? ['profile', 'security', 'settings', 'notifications', 'library']
                : isAppsSection
                  ? ['apps', 'tools', 'games', 'systems']
                  : isUpdatesSection
                    ? ['updates', 'devlogs', 'articles', 'releases']
                    : ['apps', 'updates', 'tools', 'articles', 'projects', 'experiments']
            }
            className="inline-flex text-[11px] sm:text-xs font-normal text-[hsl(var(--muted-foreground))] group-hover:text-[hsl(var(--foreground))] transition-colors truncate"
          />
        </div>

        <kbd className="hidden lg:inline-flex shrink-0 items-center px-1.5 py-0.5 text-[10px] font-mono text-[hsl(var(--foreground))]/60 bg-white/40 dark:bg-white/10 border border-black/10 dark:border-white/10 rounded backdrop-blur-xs">
          ⌘ K
        </kbd>
      </button>

      {open && <SearchOverlay open={open} onClose={handleClose} />}
    </>
  );
}
