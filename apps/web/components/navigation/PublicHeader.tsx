'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@elsesourav/ui';
import { SITE_CONFIG, ROUTES } from '@elsesourav/config';
import { BrandLogo } from '@/components/brand/BrandLogo';
import { Shield, Layers, FileText, Sparkles } from 'lucide-react';
import { UserAvatarMenu } from '@/features/user/components/UserAvatarMenu';
import { SearchButton } from '@/components/search/SearchButton';
import { ThemePopup } from '@/components/theme/ThemePopup';
import { useHideOnScroll } from '@elsesourav/ui/interior';
import type { AuthenticatedUser } from '@elsesourav/auth';

export interface PublicHeaderProps {
  user?: AuthenticatedUser | null;
  siteName?: string;
  logoUrl?: string;
  brandLogoUrl?: string;
}

export function PublicHeader({
  user,
  siteName,
  logoUrl,
  brandLogoUrl,
}: PublicHeaderProps) {
  const pathname = usePathname();

  const {
    isVisible,
    isScrolled,
    ref: headerRef,
  } = useHideOnScroll<HTMLElement>({
    hideAfter: 14,
    revealAfter: 6,
    topGuard: 64,
    useWindow: true,
  });

  const navLinks = [
    {
      href: ROUTES.APPS,
      label: 'Apps',
      description: 'Production software, tools & utilities',
      icon: Layers,
    },
    {
      href: ROUTES.UPDATES,
      label: 'Updates',
      description: 'News, releases & thoughts from my journey',
      icon: FileText,
    },
    {
      href: ROUTES.ABOUT,
      label: 'About',
      description: 'Background, stack & design principles',
      icon: Sparkles,
    },
  ];

  return (
    <header
      ref={headerRef}
      className={`sticky top-0 z-50 w-full transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none ${
        isVisible
          ? 'translate-y-0 will-change-transform'
          : '-translate-y-full will-change-transform'
      }`}
    >
      <div
        className={`transition-[background-color,border-color,backdrop-filter,box-shadow] duration-300 ${
          isScrolled
            ? 'border-b border-[hsl(var(--border))]/80 bg-[hsl(var(--background))]/80 backdrop-blur-md shadow-sm shadow-black/5 dark:shadow-black/20'
            : 'border-b border-black/5 dark:border-white/10 bg-transparent backdrop-blur-[4px]'
        }`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 h-16 flex items-center justify-between gap-1.5 sm:gap-2.5 lg:gap-4">
          {/* Brand Logo: compact and proportional on mobile, standard on desktop */}
          <Link
            href={ROUTES.HOME}
            className="flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] rounded-lg p-0.5 sm:p-1 shrink-0"
            aria-label={`${siteName || SITE_CONFIG.name} Home`}
          >
            <BrandLogo
              variant="color"
              size="md"
              priority
              name={siteName}
              logoUrl={logoUrl}
              brandLogoUrl={brandLogoUrl}
            />
          </Link>

          {/* Desktop Navigation Links */}
          <nav
            aria-label="Primary navigation"
            className="hidden md:flex items-center gap-1 lg:gap-1.5 text-sm shrink-0"
          >
            {navLinks.map((link) => {
              const isActive =
                pathname === link.href || pathname.startsWith(`${link.href}/`);
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => {
                    if (link.href === ROUTES.ABOUT) {
                      window.dispatchEvent(
                        new CustomEvent('elsesourav:about-activate')
                      );
                    }
                  }}
                  aria-current={isActive ? 'page' : undefined}
                  className={`inline-flex items-center gap-1.5 px-3 lg:px-3.5 py-1.5 rounded-xl transition-all duration-200 font-medium text-xs lg:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                    isActive
                      ? 'bg-indigo-500/12 dark:bg-indigo-500/22 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30 dark:border-indigo-400/35 font-semibold shadow-[0_1px_8px_rgba(99,102,241,0.12)]'
                      : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--surface-subtle))] border border-transparent active:scale-95'
                  }`}
                >
                  <Icon
                    className={`w-3.5 h-3.5 transition-colors ${
                      isActive
                        ? 'text-indigo-600 dark:text-indigo-400'
                        : 'text-[hsl(var(--muted-foreground))] opacity-75'
                    }`}
                  />
                  <span>{link.label}</span>
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400 shadow-[0_0_6px_rgba(99,102,241,0.6)] ml-0.5" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Search Input Box: larger and prominent on both mobile & desktop */}
          <div className="flex-1 max-w-[240px] xs:max-w-[280px] sm:max-w-sm md:max-w-xs lg:max-w-sm mx-1 sm:mx-2 min-w-0">
            <SearchButton />
          </div>

          {/* Utility & Actions Cluster */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Theme Changer: positioned on the far right on mobile screens */}
            <ThemePopup />

            {/* Desktop-Only Auth / Profile Controls: completely hidden on mobile */}
            {user ? (
              <div className="hidden md:flex items-center gap-2.5 ml-1">
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
                <Link
                  href={ROUTES.LOGIN}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium text-[hsl(var(--foreground))]/80 hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--surface-subtle))]/60 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href={ROUTES.SIGNUP}
                  className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/35 transition-all duration-200 active:scale-95"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
