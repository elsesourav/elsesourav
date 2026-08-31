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
      <nav className="hidden md:flex items-center gap-1 text-xs font-medium text-muted-foreground">
        {NAV_LINKS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={`relative flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'text-foreground font-semibold'
                  : 'hover:text-foreground hover:bg-accent/60'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
              <span>{label}</span>
              {/* Active indicator underline */}
              {isActive && (
                <span className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full bg-primary shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
              )}
            </Link>
          );
        })}

        {user.role === 'ADMIN' && (
          <Link
            href="/admin"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-500/10 text-amber-500 dark:text-amber-300 border border-amber-500/20 hover:bg-amber-500/20 transition-colors ml-2"
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
        className="md:hidden p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent focus:outline-none"
        aria-label="Toggle navigation menu"
      >
        {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile Dropdown Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-16 bg-background/95 border-b border-border p-4 space-y-2 backdrop-blur-2xl z-50 shadow-xl">
          <div className="pb-2 mb-2 border-b border-border/60 flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Signed in as <strong className="text-foreground">{user.email}</strong>
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted font-mono">
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
                      ? 'bg-primary/15 text-primary border border-primary/30 font-semibold'
                      : 'bg-card text-card-foreground hover:bg-accent border border-border/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span>{label}</span>
                </Link>
              );
            })}
          </div>

          {user.role === 'ADMIN' && (
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 p-2.5 rounded-xl text-xs font-medium bg-amber-500/10 text-amber-500 dark:text-amber-300 border border-amber-500/20"
            >
              <Shield className="w-4 h-4" />
              <span>Admin Portal</span>
            </Link>
          )}

          <div className="pt-2 border-t border-border/60">
            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl text-xs font-medium text-rose-500 dark:text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 transition-colors"
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
