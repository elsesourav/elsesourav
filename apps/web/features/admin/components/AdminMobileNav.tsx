'use client';

import { ROUTES } from '@elsesourav/config';
import type { AdminContext } from '@elsesourav/types';
import { Badge, Button } from '@elsesourav/ui';
import {
  Activity,
  ArrowLeft,
  BookOpen,
  FileText,
  Image,
  LifeBuoy,
  Menu,
  Package,
  Shield,
  Sliders,
  Users,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as React from 'react';

interface AdminMobileNavProps {
  context: AdminContext;
}

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: Activity, exact: true },
  { href: '/admin/apps', label: 'Applications', icon: Package },
  { href: '/admin/blog', label: 'Devlogs CMS', icon: FileText },
  { href: '/admin/help', label: 'Help Articles', icon: BookOpen },
  { href: '/admin/support', label: 'Support Queue', icon: LifeBuoy },
  { href: '/admin/users', label: 'User Directory', icon: Users },
  { href: '/admin/media', label: 'Media Library', icon: Image },
  { href: '/admin/settings', label: 'Portal Config', icon: Sliders },
];

export function AdminMobileNav({ context }: AdminMobileNavProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = React.useState(false);

  // Close menu on route change
  React.useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Handle escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const isLinkActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <div className="md:hidden border-b border-zinc-800/80 bg-zinc-950 px-4 py-3 sticky top-0 z-40">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-950/80 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-xs text-zinc-100 flex items-center gap-1.5">
              <span>Admin Portal</span>
              <Badge variant="warning" className="text-[9px] px-1 py-0">
                {context.role}
              </Badge>
            </div>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="h-8 w-8 p-0 text-zinc-400 hover:text-zinc-100"
          aria-label="Toggle navigation menu"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* Drawer */}
      {isOpen && (
        <div className="fixed inset-0 top-[53px] z-50 bg-zinc-950/95 backdrop-blur-xl p-6 flex flex-col justify-between border-t border-zinc-800">
          <nav className="space-y-1.5 text-sm font-medium">
            {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
              const active = isLinkActive(href, exact);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    active
                      ? 'bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 shadow-sm font-semibold'
                      : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-indigo-400' : 'text-zinc-400'}`} />
                  <span>{label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="pt-6 border-t border-zinc-800/80">
            <Link
              href={ROUTES.HOME}
              className="flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Public Site</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
