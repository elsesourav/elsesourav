'use client';

import * as React from 'react';
import { Search } from 'lucide-react';
import { SearchOverlay } from './SearchOverlay';

export function SearchButton() {
  const [open, setOpen] = React.useState(false);
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  // Global Cmd+K / Ctrl+K keyboard shortcut
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger when typing in inputs/textareas
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleClose = React.useCallback(() => {
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
        className="flex items-center gap-1.5 h-9 px-2.5 rounded-xl text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--background))]"
        aria-label="Search"
      >
        <Search className="w-4 h-4" />
        <kbd className="hidden lg:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-[hsl(var(--subtle-foreground))] bg-[hsl(var(--surface-subtle))] border border-[hsl(var(--border))] rounded-md">
          ⌘K
        </kbd>
      </button>

      <SearchOverlay open={open} onClose={handleClose} />
    </>
  );
}
