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

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-zinc-700 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500"
        aria-label="User account menu"
        aria-expanded={open}
      >
        <div className="w-8 h-8 rounded-full overflow-hidden bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-semibold text-zinc-300">
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
        <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl p-2 z-50 text-xs space-y-1 backdrop-blur-xl">
          <div className="px-3 py-2 border-b border-zinc-800/80">
            <p className="font-semibold text-zinc-100 truncate">
              {user.displayName || 'ElseSourav Member'}
            </p>
            <p className="text-[11px] text-zinc-400 truncate">{user.email}</p>
          </div>

          <Link
            href="/profile"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-800/80 transition-colors"
          >
            <User className="w-3.5 h-3.5 text-zinc-400" />
            <span>View Profile</span>
          </Link>

          <Link
            href="/settings"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-800/80 transition-colors"
          >
            <Settings className="w-3.5 h-3.5 text-zinc-400" />
            <span>Account Settings</span>
          </Link>

          <div className="pt-1 border-t border-zinc-800/80">
            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-colors"
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
