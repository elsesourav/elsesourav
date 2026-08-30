'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  User,
  Settings,
  LifeBuoy,
  Bell,
  Menu,
  X,
  LogOut,
  Shield,
} from 'lucide-react';
import type { AuthenticatedUser } from '@elsesourav/auth';

interface UserNavProps {
  user: AuthenticatedUser;
}

const NAV_LINKS = [
  { href: '/profile', label: 'Profile', icon: User },
  { href: '/settings', label: 'Settings', icon: Settings },
  { href: '/support/tickets', label: 'Support', icon: LifeBuoy },
  { href: '/notifications', label: 'Notifications', icon: Bell },
] as const;

export function UserNav({ user }: UserNavProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <>
      {/* Desktop Navigation Links */}
      <nav className="hidden md:flex items-center gap-1 text-xs font-medium text-zinc-400">
        {NAV_LINKS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                isActive
                  ? 'bg-zinc-800/90 text-white font-semibold shadow-sm'
                  : 'hover:text-zinc-200 hover:bg-zinc-900/60'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-400' : 'text-zinc-400'}`} />
              <span>{label}</span>
            </Link>
          );
        })}

        {user.role === 'ADMIN' && (
          <Link
            href="/admin"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-500/10 text-amber-300 border border-amber-500/20 hover:bg-amber-500/20 transition-colors ml-2"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Admin</span>
          </Link>
        )}
      </nav>

      {/* Mobile Menu Button */}
      <button
        type="button"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="md:hidden p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 focus:outline-none"
        aria-label="Toggle navigation menu"
      >
        {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile Dropdown Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-16 bg-zinc-950/95 border-b border-zinc-800/80 p-4 space-y-2 backdrop-blur-xl z-50">
          <div className="pb-2 mb-2 border-b border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
            <span>
              Signed in as <strong className="text-zinc-200">{user.email}</strong>
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 font-mono">
              {user.role}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {NAV_LINKS.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href || pathname.startsWith(`${href}/`);
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white'
                      : 'bg-zinc-900/80 text-zinc-300 hover:bg-zinc-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </Link>
              );
            })}
          </div>

          {user.role === 'ADMIN' && (
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 p-2.5 rounded-xl text-xs font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20"
            >
              <Shield className="w-4 h-4" />
              <span>Admin Portal</span>
            </Link>
          )}

          <div className="pt-2 border-t border-zinc-800">
            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl text-xs font-medium text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 transition-colors"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
