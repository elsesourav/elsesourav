'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@elsesourav/ui';
import { SITE_CONFIG, ROUTES } from '@elsesourav/config';
import Image from 'next/image';
import { Menu, X, ArrowRight, LayoutDashboard, Shield } from 'lucide-react';
import { UserAvatarMenu } from '@/features/user/components/UserAvatarMenu';
import { SearchButton } from '@/components/search/SearchButton';
import { ThemePopup } from '@/components/theme/ThemePopup';
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
    { href: ROUTES.LAB, label: 'Lab' },
    { href: ROUTES.BLOG, label: 'Notes' },
    { href: ROUTES.ABOUT, label: 'About' },
  ];

  return (
    <header className="border-b border-[hsl(var(--border))]/80 bg-[hsl(var(--background))]/80 backdrop-blur-md sticky top-0 z-50 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link
          href={ROUTES.HOME}
          className="flex items-center gap-2.5 font-bold text-base sm:text-lg text-[hsl(var(--foreground))] group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] rounded-lg p-1"
        >
          <div className="w-8 h-8 rounded-xl overflow-hidden flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
            <Image
              src="/logo-sm.png"
              alt={`${SITE_CONFIG.name} Logo`}
              width={32}
              height={32}
              className="w-full h-full object-contain"
              priority
            />
          </div>
          <span className="tracking-tight">{SITE_CONFIG.name}</span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav
          aria-label="Primary navigation"
          className="hidden md:flex items-center gap-1 lg:gap-2 text-sm"
        >
          {navLinks.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? 'page' : undefined}
                className={`px-3.5 py-1.5 rounded-lg transition-all font-medium text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] ${
                  isActive
                    ? 'bg-[hsl(var(--accent))] text-[hsl(var(--foreground))] font-semibold shadow-inner'
                    : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))]/60'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Utility & Auth Actions */}
        <div className="hidden md:flex items-center gap-2">
          <SearchButton />
          <ThemePopup />
          <div className="w-px h-5 bg-[hsl(var(--border))] mx-1" />
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
                <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">
                  <LayoutDashboard className="w-3.5 h-3.5 text-[hsl(var(--primary))]" />
                  <span>Dashboard</span>
                </Button>
              </Link>
              <UserAvatarMenu user={user} />
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <Link href={ROUTES.LOGIN}>
                <Button variant="ghost" size="sm" className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] text-xs">
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
        <div className="flex items-center gap-1.5 md:hidden">
          <SearchButton />
          <ThemePopup />
          {user && <UserAvatarMenu user={user} />}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="h-10 w-10 p-0 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] rounded-xl"
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
          className="md:hidden fixed inset-0 top-16 z-50 bg-[hsl(var(--background))]/95 backdrop-blur-2xl px-5 py-6 flex flex-col justify-between border-t border-[hsl(var(--border))] animate-in fade-in slide-in-from-top-2 duration-200 overflow-y-auto"
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
                      : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))]/60'
                  }`}
                >
                  <span>{link.label}</span>
                  <ArrowRight className="w-4 h-4 text-[hsl(var(--subtle-foreground))]" />
                </Link>
              );
            })}

            {user && (
              <>
                <div className="pt-2 pb-1">
                  <div className="h-px bg-[hsl(var(--border))]/80 my-2" />
                </div>
                <Link
                  href={ROUTES.DASHBOARD}
                  className="flex items-center justify-between px-4 py-3.5 rounded-xl text-base font-medium text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))]/60 min-h-[44px]"
                >
                  <span className="flex items-center gap-2">
                    <LayoutDashboard className="w-4 h-4 text-[hsl(var(--primary))]" />
                    <span>User Dashboard</span>
                  </span>
                  <ArrowRight className="w-4 h-4 text-[hsl(var(--subtle-foreground))]" />
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
            <div className="pt-6 border-t border-[hsl(var(--border))]/80 space-y-3">
              <Link href={ROUTES.SIGNUP} className="block">
                <Button
                  size="lg"
                  className="w-full justify-center bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 text-white font-semibold min-h-[44px]"
                >
                  Get Started
                </Button>
              </Link>
              <Link href={ROUTES.LOGIN} className="block">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full justify-center border-[hsl(var(--border-strong))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))] min-h-[44px]"
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
