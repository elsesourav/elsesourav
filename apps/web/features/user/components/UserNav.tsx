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
  ArrowRight,
} from 'lucide-react';
import type { AuthenticatedUser } from '@elsesourav/auth';

interface UserNavProps {
  user: AuthenticatedUser;
  desktopOnly?: boolean;
  mobileOnly?: boolean;
}

const NAV_LINKS = [
  { href: '/profile', label: 'Profile', icon: User, description: 'View & manage your identity' },
  { href: '/settings', label: 'Settings', icon: Settings, description: 'Security, password & preferences' },
  { href: '/support/tickets', label: 'Support', icon: LifeBuoy, description: 'Tickets & help assistance' },
  { href: '/notifications', label: 'Notifications', icon: Bell, description: 'Activity & system alerts' },
] as const;

export function UserNav({ user, desktopOnly = false, mobileOnly = false }: UserNavProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [isClosing, setIsClosing] = React.useState(false);
  const mobileMenuRef = React.useRef<HTMLDivElement>(null);
  const toggleBtnRef = React.useRef<HTMLButtonElement>(null);

  const requestClose = React.useCallback(() => {
    if (isClosing) return;
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      setMobileMenuOpen(false);
    }, 180);
  }, [isClosing]);

  // Close mobile menu on route change
  React.useEffect(() => {
    setIsClosing(false);
    setMobileMenuOpen(false);
  }, [pathname]);

  // Lock body scroll and listen for Escape key when mobile menu is open
  React.useEffect(() => {
    if (mobileMenuOpen) {
      const scrollY = window.scrollY;
      const originalBodyOverflow = document.body.style.overflow;
      const originalHtmlOverflow = document.documentElement.style.overflow;

      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          requestClose();
          toggleBtnRef.current?.focus();
        }
      };
      window.addEventListener('keydown', handleKeyDown);

      return () => {
        document.documentElement.style.overflow = originalHtmlOverflow;
        document.body.style.overflow = originalBodyOverflow;
        window.scrollTo(0, scrollY);
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [mobileMenuOpen, requestClose]);

  // Close on outside tap
  React.useEffect(() => {
    if (!mobileMenuOpen || isClosing) return;

    const handlePointerOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(target) &&
        toggleBtnRef.current &&
        !toggleBtnRef.current.contains(target)
      ) {
        requestClose();
      }
    };

    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handlePointerOutside);
      document.addEventListener('touchstart', handlePointerOutside, { passive: true });
    }, 50);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handlePointerOutside);
      document.removeEventListener('touchstart', handlePointerOutside);
    };
  }, [mobileMenuOpen, isClosing, requestClose]);

  return (
    <>
      {/* Desktop Navigation Links */}
      {!mobileOnly && (
        <nav aria-label="Primary authenticated navigation" className="hidden md:flex items-center gap-1 text-xs font-medium text-muted-foreground">
          {NAV_LINKS.slice(0, 3).map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                aria-current={isActive ? 'page' : undefined}
                className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'text-foreground font-semibold bg-accent/60 shadow-inner'
                    : 'hover:text-foreground hover:bg-accent/40'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                <span>{label}</span>
                {isActive && (
                  <span className="absolute bottom-0.5 left-3 right-3 h-[2px] rounded-full bg-primary" />
                )}
              </Link>
            );
          })}

          {user.role === 'ADMIN' && (
            <Link
              href="/admin"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-300 border border-amber-500/20 hover:bg-amber-500/20 transition-colors ml-1 font-medium cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin</span>
            </Link>
          )}
        </nav>
      )}

      {/* Mobile Menu Button */}
      {!desktopOnly && (
        <div className="md:hidden">
          <button
            ref={toggleBtnRef}
            type="button"
            onClick={() => {
              if (mobileMenuOpen) {
                requestClose();
              } else {
                setIsClosing(false);
                setMobileMenuOpen(true);
              }
            }}
            className="flex items-center justify-center h-10 w-10 min-h-[40px] min-w-[40px] rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer active:scale-95 transition-all"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      )}

      {/* Mobile Full Navigation Overlay */}
      {!desktopOnly && mobileMenuOpen && (
        <div
          ref={mobileMenuRef}
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation Menu"
          className={`md:hidden fixed inset-x-0 top-16 bottom-0 z-[1000] bg-background/95 backdrop-blur-2xl flex flex-col justify-between p-5 sm:p-6 overflow-y-auto overscroll-contain border-t border-border ${
            isClosing ? 'animate-mobile-nav-out' : 'animate-mobile-nav-in'
          }`}
        >
          <div className="space-y-6">
            {/* User Greeting Bar */}
            <div className="p-3.5 rounded-2xl bg-card border border-border/80 flex items-center justify-between text-xs shadow-sm">
              <div className="min-w-0">
                <p className="font-semibold text-foreground truncate text-xs">
                  {user.displayName || 'ElseSourav Member'}
                </p>
                <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
              </div>
              {user.role === 'ADMIN' && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md font-semibold bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/30 shrink-0">
                  ADMIN
                </span>
              )}
            </div>

            {/* Navigation List */}
            <div className="space-y-2">
              <p className="text-[11px] font-mono tracking-wider text-muted-foreground uppercase px-1">
                Account Navigation
              </p>

              <nav aria-label="Mobile account navigation" className="space-y-2">
                {NAV_LINKS.map(({ href, label, icon: Icon, description }) => {
                  const isActive = pathname === href || pathname.startsWith(`${href}/`);
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => requestClose()}
                      aria-current={isActive ? 'page' : undefined}
                      className={`flex items-center justify-between p-3.5 rounded-2xl transition-all min-h-[52px] active:scale-[0.99] border cursor-pointer ${
                        isActive
                          ? 'bg-accent border-border text-foreground font-semibold shadow-sm'
                          : 'bg-card/60 border-border/60 text-foreground hover:bg-accent'
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            isActive
                              ? 'bg-primary/15 text-primary'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 text-left">
                          <span className="block text-sm font-semibold leading-tight">{label}</span>
                          <span className="block text-[11px] text-muted-foreground truncate mt-0.5">
                            {description}
                          </span>
                        </div>
                      </div>
                      <ArrowRight
                        className={`w-4 h-4 shrink-0 transition-transform ${
                          isActive ? 'text-primary translate-x-0.5' : 'text-muted-foreground'
                        }`}
                      />
                    </Link>
                  );
                })}

                {user.role === 'ADMIN' && (
                  <Link
                    href="/admin"
                    onClick={() => requestClose()}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-300 min-h-[52px] active:scale-[0.99] transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                        <Shield className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-semibold">Admin Portal</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-amber-500" />
                  </Link>
                )}
              </nav>
            </div>
          </div>

          {/* Bottom Sign-out Drawer Footer */}
          <div className="pt-6 mt-6 border-t border-border/80 space-y-3">
            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 p-3 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
