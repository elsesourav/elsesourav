'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@elsesourav/ui';
import { SITE_CONFIG, ROUTES } from '@elsesourav/config';
import Image from 'next/image';
import {
  Menu,
  X,
  ArrowRight,
  Shield,
  Layers,
  FileText,
  Sparkles,
  HelpCircle,
  LifeBuoy,
  User,
  Settings,
} from 'lucide-react';
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
  const mobileMenuRef = React.useRef<HTMLDivElement>(null);
  const toggleButtonRef = React.useRef<HTMLButtonElement>(null);

  const [isMobileMenuClosing, setIsMobileMenuClosing] = React.useState(false);

  const requestCloseMobileMenu = React.useCallback(() => {
    if (isMobileMenuClosing) return;
    setIsMobileMenuClosing(true);
    setTimeout(() => {
      setIsMobileMenuClosing(false);
      setMobileMenuOpen(false);
    }, 180);
  }, [isMobileMenuClosing]);

  // Close mobile menu automatically on route changes
  React.useEffect(() => {
    setIsMobileMenuClosing(false);
    setMobileMenuOpen(false);
  }, [pathname]);

  // Lock body & html scroll and handle escape key when mobile menu is open
  React.useEffect(() => {
    if (mobileMenuOpen) {
      const scrollY = window.scrollY;
      const originalBodyOverflow = document.body.style.overflow;
      const originalHtmlOverflow = document.documentElement.style.overflow;
      const originalBodyPosition = document.body.style.position;
      const originalBodyTop = document.body.style.top;
      const originalBodyWidth = document.body.style.width;

      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') requestCloseMobileMenu();
      };
      window.addEventListener('keydown', handleKeyDown);

      return () => {
        document.documentElement.style.overflow = originalHtmlOverflow;
        document.body.style.overflow = originalBodyOverflow;
        document.body.style.position = originalBodyPosition;
        document.body.style.top = originalBodyTop;
        document.body.style.width = originalBodyWidth;
        window.scrollTo(0, scrollY);
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [mobileMenuOpen, requestCloseMobileMenu]);

  // Close mobile menu on outside pointer tap/click
  React.useEffect(() => {
    if (!mobileMenuOpen || isMobileMenuClosing) return;

    const handlePointerOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(target) &&
        toggleButtonRef.current &&
        !toggleButtonRef.current.contains(target)
      ) {
        requestCloseMobileMenu();
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
  }, [mobileMenuOpen, isMobileMenuClosing, requestCloseMobileMenu]);

  const navLinks = [
    {
      href: ROUTES.APPS,
      label: 'Apps',
      description: 'Production software, tools & utilities',
      icon: Layers,
    },
    {
      href: ROUTES.BLOG,
      label: 'Notes',
      description: 'Engineering notes, architecture & ideas',
      icon: FileText,
    },
    {
      href: ROUTES.ABOUT,
      label: 'About',
      description: 'Background, stack & design principles',
      icon: Sparkles,
    },
    {
      href: ROUTES.HELP,
      label: 'Help & Docs',
      description: 'Knowledge base, guides & troubleshooting',
      icon: HelpCircle,
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="border-b border-[hsl(var(--border))]/80 bg-[hsl(var(--background))]/80 backdrop-blur-md transition-colors">
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
            className="hidden md:flex items-center gap-1 lg:gap-1.5 text-sm"
          >
            {navLinks.slice(0, 3).map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={`px-3.5 py-1.5 rounded-xl transition-all duration-150 ease-smooth font-medium text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] ${
                    isActive
                      ? 'bg-[hsl(var(--accent))] text-[hsl(var(--foreground))] font-semibold shadow-inner'
                      : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--surface-subtle))] active:scale-95'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Header Utility & Actions Cluster */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <SearchButton />
            <ThemePopup />

            {/* Desktop Auth / User Controls */}
            {user ? (
              <div className="hidden md:flex items-center gap-3 ml-1">
                <div className="w-px h-5 bg-[hsl(var(--border))] mx-0.5" />
                {user.role === 'ADMIN' && (
                  <Link href={ROUTES.ADMIN.ROOT}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1.5 text-xs text-amber-400 hover:text-amber-300 hover:bg-amber-950/30"
                    >
                      <Shield className="w-3.5 h-3.5" />
                      <span>Admin</span>
                    </Button>
                  </Link>
                )}
                <UserAvatarMenu user={user} />
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2 ml-1">
                <div className="w-px h-5 bg-[hsl(var(--border))] mx-0.5" />
                <Link href={ROUTES.LOGIN}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] text-xs"
                  >
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

            {/* Mobile User Avatar when logged in */}
            {user && (
              <div className="md:hidden">
                <UserAvatarMenu user={user} />
              </div>
            )}

            {/* Mobile Menu Toggle Button */}
            <div className="md:hidden">
              <button
                ref={toggleButtonRef}
                type="button"
                onClick={() => {
                  if (mobileMenuOpen) {
                    requestCloseMobileMenu();
                  } else {
                    setIsMobileMenuClosing(false);
                    setMobileMenuOpen(true);
                  }
                }}
                className="h-10 w-10 min-h-[40px] min-w-[40px] p-0 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--surface-subtle))] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] rounded-xl active:scale-95 transition-all duration-150 flex items-center justify-center cursor-pointer"
                aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5 text-[hsl(var(--foreground))]" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Full-Screen Mobile Navigation Menu Overlay */}
      {mobileMenuOpen && (
        <div
          ref={mobileMenuRef}
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation Menu"
          className={`md:hidden fixed inset-x-0 top-16 bottom-0 z-[1000] bg-[hsl(var(--background))]/95 backdrop-blur-2xl flex flex-col justify-between p-5 sm:p-6 overflow-y-auto overscroll-contain border-t border-[hsl(var(--border))] ${
            isMobileMenuClosing ? 'animate-mobile-nav-out' : 'animate-mobile-nav-in'
          }`}
        >
          {/* Main Navigation Stack */}
          <div className="space-y-6">
            <div>
              <p className="text-[11px] font-mono tracking-wider text-[hsl(var(--subtle-foreground))] uppercase mb-3 px-1">
                Navigation
              </p>
              <nav aria-label="Mobile primary navigation" className="space-y-2">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => requestCloseMobileMenu()}
                      aria-current={isActive ? 'page' : undefined}
                      className={`flex items-center justify-between p-3.5 rounded-2xl transition-all min-h-[56px] active:scale-[0.99] border ${
                        isActive
                          ? 'bg-[hsl(var(--accent))] border-[hsl(var(--border-strong))] text-[hsl(var(--foreground))] font-semibold shadow-sm'
                          : 'bg-[hsl(var(--card))]/60 border-[hsl(var(--border))]/60 text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))] hover:border-[hsl(var(--border))]'
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            isActive
                              ? 'bg-[hsl(var(--primary))]/15 text-[hsl(var(--primary))]'
                              : 'bg-[hsl(var(--surface-subtle))] text-[hsl(var(--muted-foreground))]'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 text-left">
                          <span className="block text-base font-semibold leading-tight">
                            {link.label}
                          </span>
                          <span className="block text-xs text-[hsl(var(--muted-foreground))] truncate mt-0.5">
                            {link.description}
                          </span>
                        </div>
                      </div>
                      <ArrowRight
                        className={`w-4 h-4 shrink-0 transition-transform ${isActive ? 'text-[hsl(var(--primary))] translate-x-0.5' : 'text-[hsl(var(--subtle-foreground))]'}`}
                      />
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Authenticated User Quick Links */}
            {user && (
              <div>
                <p className="text-[11px] font-mono tracking-wider text-[hsl(var(--subtle-foreground))] uppercase mb-3 px-1">
                  Account & Portal
                </p>
                <div className="space-y-2">
                  <Link
                    href={ROUTES.PROFILE}
                    onClick={() => requestCloseMobileMenu()}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-[hsl(var(--card))]/60 border border-[hsl(var(--border))]/60 text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))] min-h-[52px] active:scale-[0.99] transition-all"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
                        <User className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-semibold">View Profile</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[hsl(var(--subtle-foreground))]" />
                  </Link>

                  <Link
                    href={ROUTES.SETTINGS}
                    onClick={() => requestCloseMobileMenu()}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-[hsl(var(--card))]/60 border border-[hsl(var(--border))]/60 text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))] min-h-[52px] active:scale-[0.99] transition-all"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
                        <Settings className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-semibold">Account Settings</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[hsl(var(--subtle-foreground))]" />
                  </Link>

                  {user.role === 'ADMIN' && (
                    <Link
                      href={ROUTES.ADMIN.ROOT}
                      onClick={() => requestCloseMobileMenu()}
                      className="flex items-center justify-between p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 hover:bg-amber-500/15 min-h-[52px] active:scale-[0.99] transition-all"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                          <Shield className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-semibold text-amber-300">Admin Portal</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-amber-400" />
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Bottom Auth / Explore Footer */}
          <div className="pt-6 mt-6 border-t border-[hsl(var(--border))]/80 space-y-4">
            {!user ? (
              <div className="space-y-2.5">
                <Link
                  href={ROUTES.SIGNUP}
                  onClick={() => requestCloseMobileMenu()}
                  className="block"
                >
                  <Button
                    size="lg"
                    className="w-full justify-center bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 text-white font-semibold min-h-[48px] rounded-xl shadow-lg active:scale-[0.99] text-base cursor-pointer"
                  >
                    Get Started
                  </Button>
                </Link>
                <Link
                  href={ROUTES.LOGIN}
                  onClick={() => requestCloseMobileMenu()}
                  className="block"
                >
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full justify-center border-[hsl(var(--border))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))] min-h-[48px] rounded-xl active:scale-[0.99] text-base font-medium cursor-pointer"
                  >
                    Sign In
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="flex items-center justify-between px-2 text-xs text-[hsl(var(--muted-foreground))]">
                <span>
                  Signed in as{' '}
                  <strong className="text-[hsl(var(--foreground))] font-semibold">
                    {user.displayName || user.email}
                  </strong>
                </span>
              </div>
            )}

            <div className="flex items-center justify-between px-2 pt-2 text-[11px] text-[hsl(var(--subtle-foreground))]">
              <Link
                href={ROUTES.SUPPORT}
                onClick={() => requestCloseMobileMenu()}
                className="hover:text-[hsl(var(--foreground))] transition-colors flex items-center gap-1.5"
              >
                <LifeBuoy className="w-3.5 h-3.5" />
                <span>Support</span>
              </Link>
              <span>•</span>
              <Link
                href={ROUTES.PRIVACY}
                onClick={() => requestCloseMobileMenu()}
                className="hover:text-[hsl(var(--foreground))] transition-colors"
              >
                Privacy
              </Link>
              <span>•</span>
              <Link
                href={ROUTES.TERMS}
                onClick={() => requestCloseMobileMenu()}
                className="hover:text-[hsl(var(--foreground))] transition-colors"
              >
                Terms
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
