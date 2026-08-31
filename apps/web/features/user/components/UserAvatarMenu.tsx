'use client';

import * as React from 'react';
import Link from 'next/link';
import { LayoutDashboard, User, UserCheck, LogOut, Lock, LifeBuoy, Shield, AtSign } from 'lucide-react';
import type { AuthenticatedUser } from '@elsesourav/auth';
import { UserAvatar } from '@elsesourav/ui';

interface UserAvatarMenuProps {
  user: AuthenticatedUser;
}

export function UserAvatarMenu({ user }: UserAvatarMenuProps) {
  const [open, setOpen] = React.useState(false);
  const [isClosing, setIsClosing] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);

  const requestClose = React.useCallback((callback?: () => void) => {
    if (isClosing) return;
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      setOpen(false);
      callback?.();
    }, 130);
  }, [isClosing]);

  const handleToggle = () => {
    if (open) {
      requestClose();
    } else {
      setIsClosing(false);
      setOpen(true);
    }
  };

  // Close on outside click/tap
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        requestClose();
      }
    };
    if (open && !isClosing) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside, { passive: true });
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [open, isClosing, requestClose]);

  // Close on Escape, restore focus
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        requestClose(() => {
          triggerRef.current?.focus();
        });
      }
    };
    if (open) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, requestClose]);

  const rawUsername =
    (user as { username?: string }).username ||
    (user as unknown as { user_metadata?: { username?: string; user_name?: string } }).user_metadata?.username ||
    (user as unknown as { user_metadata?: { username?: string; user_name?: string } }).user_metadata?.user_name ||
    null;

  return (
    <div className="relative" ref={menuRef}>
      <button
        ref={triggerRef}
        type="button"
        onClick={handleToggle}
        className="relative flex items-center justify-center p-0.5 rounded-full hover:ring-2 hover:ring-primary/50 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer active:scale-95 duration-150"
        aria-label="User account menu"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <UserAvatar
          src={user.photoUrl}
          name={user.displayName}
          identifier={user.id || user.email}
          alt={user.displayName || 'User avatar'}
          size="sm"
          showStatus={true}
          statusColor="emerald"
        />
      </button>

      {open && (
        <div
          role="menu"
          aria-label="User menu"
          className={`absolute right-0 mt-2 w-60 rounded-2xl bg-popover text-popover-foreground border border-border shadow-xl p-1.5 z-50 text-xs space-y-1 backdrop-blur-2xl ${
            isClosing ? 'animate-popup-out' : 'animate-popup-in'
          }`}
        >
          {/* Identity Header */}
          <div className="px-3 py-2.5 bg-muted/60 rounded-xl border border-border/60 mb-1">
            <div className="flex items-center justify-between gap-2">
              <p className="font-semibold text-foreground truncate text-xs">
                {user.displayName || 'ElseSourav Member'}
              </p>
              {user.role === 'ADMIN' && (
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded font-medium bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/30 shrink-0">
                  ADMIN
                </span>
              )}
            </div>
            {rawUsername && (
              <p className="text-[11px] font-mono text-primary truncate flex items-center gap-0.5 mt-0.5">
                <AtSign className="w-3 h-3 inline" />
                <span>{rawUsername}</span>
              </p>
            )}
            <p className="text-[11px] text-muted-foreground truncate mt-0.5">{user.email}</p>
          </div>

          {/* Account Options */}
          <Link
            href="/profile"
            role="menuitem"
            onClick={() => requestClose()}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-foreground hover:bg-accent transition-colors cursor-pointer"
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-primary" />
            <div className="flex flex-col">
              <span className="font-medium">Dashboard</span>
              <span className="text-[10px] text-muted-foreground">Profile & overview</span>
            </div>
          </Link>

          <Link
            href="/settings?tab=profile"
            role="menuitem"
            onClick={() => requestClose()}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-foreground hover:bg-accent transition-colors cursor-pointer"
          >
            <User className="w-3.5 h-3.5 text-primary" />
            <div className="flex flex-col">
              <span className="font-medium">Profile</span>
              <span className="text-[10px] text-muted-foreground">Identity & avatar</span>
            </div>
          </Link>

          <Link
            href="/settings?tab=account"
            role="menuitem"
            onClick={() => requestClose()}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-foreground hover:bg-accent transition-colors cursor-pointer"
          >
            <UserCheck className="w-3.5 h-3.5 text-primary" />
            <div className="flex flex-col">
              <span className="font-medium">Account</span>
              <span className="text-[10px] text-muted-foreground">Credentials & details</span>
            </div>
          </Link>

          <Link
            href="/settings?tab=security"
            role="menuitem"
            onClick={() => requestClose()}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-foreground hover:bg-accent transition-colors cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5 text-primary" />
            <div className="flex flex-col">
              <span className="font-medium">Password & Security</span>
              <span className="text-[10px] text-muted-foreground">Security & access</span>
            </div>
          </Link>

          <Link
            href="/support/tickets"
            role="menuitem"
            onClick={() => requestClose()}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-foreground hover:bg-accent transition-colors cursor-pointer"
          >
            <LifeBuoy className="w-3.5 h-3.5 text-primary" />
            <div className="flex flex-col">
              <span className="font-medium">Help & Support</span>
              <span className="text-[10px] text-muted-foreground">Tickets & assistance</span>
            </div>
          </Link>

          {user.role === 'ADMIN' && (
            <Link
              href="/admin"
              role="menuitem"
              onClick={() => requestClose()}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-amber-600 dark:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 transition-colors cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5 text-amber-500" />
              <div className="flex flex-col">
                <span className="font-medium">Admin Portal</span>
                <span className="text-[10px] text-amber-600/70 dark:text-amber-400/70">System management</span>
              </div>
            </Link>
          )}

          {/* Sign Out */}
          <div className="pt-1 border-t border-border/80">
            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                role="menuitem"
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer text-left font-medium"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400" />
                <span>Sign Out</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
