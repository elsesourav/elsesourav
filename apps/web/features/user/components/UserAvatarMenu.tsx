'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { User, LogOut, Settings } from 'lucide-react';
import type { AuthenticatedUser } from '@elsesourav/auth';

interface UserAvatarMenuProps {
  user: AuthenticatedUser;
}

export function UserAvatarMenu({ user }: UserAvatarMenuProps) {
  const [open, setOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);

  // Close on outside click
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  // Close on Escape, restore focus
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    if (open) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-[hsl(var(--border-strong))] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]"
        aria-label="User account menu"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <div className="w-8 h-8 rounded-full overflow-hidden bg-[hsl(var(--surface-elevated))] border border-[hsl(var(--border))] flex items-center justify-center text-xs font-semibold text-[hsl(var(--muted-foreground))]">
          {user.photoUrl ? (
            <Image
              src={user.photoUrl}
              alt={user.displayName || 'User'}
              width={32}
              height={32}
              className="w-full h-full object-cover"
            />
          ) : (
            <span>{user.displayName?.slice(0, 2).toUpperCase() || 'U'}</span>
          )}
        </div>
      </button>

      {open && (
        <div
          role="menu"
          aria-label="User menu"
          className="absolute right-0 mt-2 w-56 rounded-2xl bg-[hsl(var(--surface-elevated))] border border-[hsl(var(--border))] shadow-2xl p-2 z-50 text-xs space-y-1 backdrop-blur-xl animate-scale-in"
        >
          <div className="px-3 py-2 border-b border-[hsl(var(--border))]/80">
            <p className="font-semibold text-[hsl(var(--foreground))] truncate">
              {user.displayName || 'ElseSourav Member'}
            </p>
            <p className="text-[11px] text-[hsl(var(--muted-foreground))] truncate">{user.email}</p>
          </div>

          <Link
            href="/profile"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))] transition-colors"
          >
            <User className="w-3.5 h-3.5" />
            <span>View Profile</span>
          </Link>

          <Link
            href="/settings"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))] transition-colors"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Account Settings</span>
          </Link>

          <div className="pt-1 border-t border-[hsl(var(--border))]/80">
            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-[hsl(var(--destructive))] hover:bg-[hsl(var(--destructive))]/10 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
