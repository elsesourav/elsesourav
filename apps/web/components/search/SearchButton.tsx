'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Search } from 'lucide-react';
import { SearchOverlay } from './SearchOverlay';

export function SearchButton() {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

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
        setOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
    // Restore focus to the search button
    setTimeout(() => buttonRef.current?.focus(), 50);
  }, []);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen(true)}
        className="shrink-0 flex items-center justify-center md:justify-between gap-2.5 h-9 w-9 md:w-auto md:h-9 md:px-3 md:py-1.5 rounded-xl md:rounded-full border border-black/10 dark:border-white/10 bg-white/10 dark:bg-white/5 backdrop-blur-[6px] hover:bg-white/20 dark:hover:bg-white/10 hover:border-black/20 dark:hover:border-white/20 text-[hsl(var(--foreground))]/80 hover:text-[hsl(var(--foreground))] active:scale-95 transition-all duration-150 ease-smooth focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] cursor-pointer group whitespace-nowrap shadow-2xs"
        aria-label="Search apps, updates, notes"
      >
        <div className="flex items-center gap-2 min-w-0">
          <Search className="w-3.5 h-3.5 shrink-0 text-[hsl(var(--foreground))]/75 group-hover:text-[hsl(var(--foreground))] transition-colors" />
          <span className="hidden lg:inline text-xs font-normal text-[hsl(var(--foreground))]/75 group-hover:text-[hsl(var(--foreground))] transition-colors truncate">
            Search apps, updates, notes...
          </span>
          <span className="hidden md:inline lg:hidden text-xs font-normal text-[hsl(var(--foreground))]/75 group-hover:text-[hsl(var(--foreground))] transition-colors truncate">
            Search...
          </span>
        </div>
        <kbd className="hidden md:inline-flex shrink-0 items-center px-1.5 py-0.5 text-[10px] font-mono text-[hsl(var(--foreground))]/60 bg-white/15 dark:bg-white/10 border border-black/10 dark:border-white/10 rounded backdrop-blur-xs">
          ⌘ K
        </kbd>
      </button>

      {open && <SearchOverlay open={open} onClose={handleClose} />}
    </>
  );
}
