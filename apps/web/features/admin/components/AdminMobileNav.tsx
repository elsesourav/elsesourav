'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Badge, Button } from '@elsesourav/ui';
import { ThemePopup } from '@/components/theme/ThemePopup';
import type { AdminContext } from '@elsesourav/types';
import {
  Activity,
  BookOpen,
  FileText,
  GalleryHorizontalEnd,
  Image,
  LifeBuoy,
  Menu,
  Package,
  Shield,
  Sliders,
  Users,
  UserCheck,
  X,
} from 'lucide-react';

interface AdminMobileNavProps {
  context: AdminContext;
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
}

const NAV_ITEMS: readonly NavItem[] = [
  { href: '/admin', label: 'Dashboard', icon: Activity, exact: true },
  { href: '/admin/apps', label: 'Applications', icon: Package },
  { href: '/admin/carousel', label: 'Hero Carousel', icon: GalleryHorizontalEnd },
  { href: '/admin/updates', label: 'Updates CMS', icon: FileText },
  { href: '/admin/help', label: 'Help Articles', icon: BookOpen },
  { href: '/admin/support', label: 'Support Queue', icon: LifeBuoy },
  { href: '/admin/users', label: 'User Directory', icon: Users },
  { href: '/admin/media', label: 'Media Library', icon: Image },
  { href: '/admin/settings', label: 'Portal Config', icon: Sliders },
  { href: '/admin/audit', label: 'Audit Trail', icon: Shield },
];

export function AdminMobileNav({ context }: AdminMobileNavProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = React.useState<boolean>(false);

  // Close menu on route change
  React.useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Lock body scrolling when drawer is open
  React.useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Handle escape key to dismiss
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen]);

  const isLinkActive = (href: string, exact?: boolean): boolean => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <div className="lg:hidden sticky top-0 z-40 border-b border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-950">
      {/* Top Header Bar */}
      <div className="px-3.5 sm:px-5 py-3 flex items-center justify-between">
        <Link href="/admin" className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-500/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase shrink-0">
            {context.displayName ? context.displayName.charAt(0) : 'A'}
          </div>
          <div className="min-w-0">
            <div className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5 truncate">
              <span>{context.displayName}</span>
              <Badge variant="warning" className="text-[9px] px-1.5 py-0 font-mono uppercase shrink-0">
                {context.role}
              </Badge>
            </div>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate max-w-[170px] sm:max-w-xs">
              {context.email}
            </p>
          </div>
        </Link>

        {/* Right Controls: Theme Switcher & Accessible Hamburger Button */}
        <div className="flex items-center gap-2">
          <ThemePopup />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(true)}
            className="h-10 w-10 p-0 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/80 rounded-xl flex items-center justify-center"
            aria-label="Open navigation menu"
            aria-expanded={isOpen}
            aria-controls="admin-mobile-drawer"
          >
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Fullscreen Mobile Drawer with Pinned Header */}
      {isOpen && (
        <div
          id="admin-mobile-drawer"
          role="dialog"
          aria-modal="true"
          aria-label="Admin Navigation Menu"
          className="fixed inset-0 z-50 bg-white dark:bg-zinc-950 flex flex-col justify-between overflow-y-auto animate-in fade-in duration-150"
        >
          {/* Drawer Pinned Header: Name & Gmail on left, Admin on right */}
          <div className="sticky top-0 z-10 px-3.5 sm:px-5 py-3 border-b border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-500/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase shrink-0">
                {context.displayName ? context.displayName.charAt(0) : 'A'}
              </div>
              <div className="min-w-0">
                <div className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5 truncate">
                  <span>{context.displayName}</span>
                  <Badge variant="warning" className="text-[9px] px-1.5 py-0 font-mono uppercase shrink-0">
                    {context.role}
                  </Badge>
                </div>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate max-w-[170px] sm:max-w-xs">
                  {context.email}
                </p>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-10 w-10 p-0 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/80 rounded-xl flex items-center justify-center"
              aria-label="Close navigation menu"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Drawer Body Content */}
          <div className="p-4 sm:p-6 space-y-5 flex-1 overflow-y-auto">
            {/* Authenticated Admin Identity Card */}
            <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-500/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                <UserCheck className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-xs text-zinc-900 dark:text-zinc-200 truncate">
                    {context.displayName}
                  </span>
                  <Badge variant="warning" className="text-[9px] px-1.5 py-0 font-mono">
                    {context.role}
                  </Badge>
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">{context.email}</p>
              </div>
            </div>

            {/* Navigation Item Links */}
            <nav className="space-y-1 text-sm font-medium" aria-label="Mobile Admin Navigation">
              {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
                const active = isLinkActive(href, exact);
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                      active
                        ? 'bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-500/40 text-indigo-700 dark:text-indigo-200 font-semibold shadow-sm'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900/60'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-indigo-600 dark:text-indigo-400' : 'text-zinc-500 dark:text-zinc-400'}`} />
                    <span className="text-xs sm:text-sm">{label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}
