'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@elsesourav/ui';
import { SITE_CONFIG, ROUTES } from '@elsesourav/config';
import { Sparkles, Menu, X, ArrowRight, LayoutDashboard, Shield } from 'lucide-react';
import { UserAvatarMenu } from '@/features/user/components/UserAvatarMenu';
import type { AuthenticatedUser } from '@elsesourav/auth';

export interface PublicHeaderProps {
  user?: AuthenticatedUser | null;
}

export function PublicHeader({ user }: PublicHeaderProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  // Close mobile menu automatically on route changes
  React.useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Handle escape key to close menu
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    if (mobileMenuOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  const navLinks = [
    { href: ROUTES.APPS, label: 'Work' },
    { href: '/apps?category=simulations', label: 'Lab' },
    { href: ROUTES.BLOG, label: 'Notes' },
    { href: ROUTES.ABOUT, label: 'About' },
  ];

  return (
    <header className="border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link
          href={ROUTES.HOME}
          className="flex items-center gap-2.5 font-bold text-base sm:text-lg text-white group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-lg p-1"
        >
          <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-105 group-hover:bg-indigo-600/30 transition-all">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="tracking-tight">{SITE_CONFIG.name}</span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav
          aria-label="Primary navigation"
          className="hidden md:flex items-center gap-1 lg:gap-2 text-sm text-zinc-300"
        >
          {navLinks.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? 'page' : undefined}
                className={`px-3.5 py-1.5 rounded-lg transition-all font-medium text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                  isActive
                    ? 'bg-zinc-800/80 text-white font-semibold shadow-inner'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Desktop User/Auth Actions */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              {user.role === 'ADMIN' && (
                <Link href={ROUTES.ADMIN.ROOT}>
                  <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-amber-400 hover:text-amber-300 hover:bg-amber-950/30">
                    <Shield className="w-3.5 h-3.5" />
                    <span>Admin</span>
                  </Button>
                </Link>
              )}
              <Link href={ROUTES.DASHBOARD}>
                <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-zinc-300 hover:text-white">
                  <LayoutDashboard className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Dashboard</span>
                </Button>
              </Link>
              <UserAvatarMenu user={user} />
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <Link href={ROUTES.LOGIN}>
                <Button variant="ghost" size="sm" className="text-zinc-300 hover:text-white text-xs">
                  Sign In
                </Button>
              </Link>
              <Link href={ROUTES.SIGNUP}>
                <Button variant="primary" size="sm" className="text-xs">
                  Get Started
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle Button */}
        <div className="flex items-center gap-2 md:hidden">
          {user && <UserAvatarMenu user={user} />}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="h-10 w-10 p-0 text-zinc-300 hover:text-white focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-xl"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Drawer Navigation Panel */}
      {mobileMenuOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation Menu"
          className="md:hidden fixed inset-0 top-16 z-50 bg-zinc-950/95 backdrop-blur-2xl px-5 py-6 flex flex-col justify-between border-t border-zinc-800 animate-in fade-in slide-in-from-top-2 duration-200 overflow-y-auto"
        >
          <nav aria-label="Mobile navigation" className="space-y-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex items-center justify-between px-4 py-3.5 rounded-xl text-base font-medium transition-all min-h-[44px] ${
                    isActive
                      ? 'bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 font-semibold shadow-sm'
                      : 'text-zinc-300 hover:text-white hover:bg-zinc-900/60'
                  }`}
                >
                  <span>{link.label}</span>
                  <ArrowRight className="w-4 h-4 text-zinc-500" />
                </Link>
              );
            })}

            {user && (
              <>
                <div className="pt-2 pb-1">
                  <div className="h-px bg-zinc-800/80 my-2" />
                </div>
                <Link
                  href={ROUTES.DASHBOARD}
                  className="flex items-center justify-between px-4 py-3.5 rounded-xl text-base font-medium text-zinc-300 hover:text-white hover:bg-zinc-900/60 min-h-[44px]"
                >
                  <span className="flex items-center gap-2">
                    <LayoutDashboard className="w-4 h-4 text-indigo-400" />
                    <span>User Dashboard</span>
                  </span>
                  <ArrowRight className="w-4 h-4 text-zinc-500" />
                </Link>
                {user.role === 'ADMIN' && (
                  <Link
                    href={ROUTES.ADMIN.ROOT}
                    className="flex items-center justify-between px-4 py-3.5 rounded-xl text-base font-medium text-amber-300 hover:bg-amber-950/30 min-h-[44px]"
                  >
                    <span className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-amber-400" />
                      <span>Admin Portal</span>
                    </span>
                    <ArrowRight className="w-4 h-4 text-amber-500/60" />
                  </Link>
                )}
              </>
            )}
          </nav>

          {/* Mobile Auth Actions */}
          {!user && (
            <div className="pt-6 border-t border-zinc-800/80 space-y-3">
              <Link href={ROUTES.SIGNUP} className="block">
                <Button
                  size="lg"
                  className="w-full justify-center bg-indigo-600 hover:bg-indigo-500 text-white font-semibold min-h-[44px]"
                >
                  Get Started
                </Button>
              </Link>
              <Link href={ROUTES.LOGIN} className="block">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full justify-center border-zinc-700 text-zinc-200 hover:bg-zinc-900 min-h-[44px]"
                >
                  Sign In
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
