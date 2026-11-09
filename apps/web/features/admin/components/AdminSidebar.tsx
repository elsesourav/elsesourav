'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Badge } from '@elsesourav/ui';
import { ROUTES } from '@elsesourav/config';
import { ThemePopup } from '@/components/theme/ThemePopup';
import type { AdminContext } from '@elsesourav/types';
import {
  Activity,
  ArrowLeft,
  BookOpen,
  FileText,
  Image,
  LifeBuoy,
  Package,
  Shield,
  Sliders,
  Users,
} from 'lucide-react';

interface AdminSidebarProps {
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
  { href: '/admin/updates', label: 'Updates CMS', icon: FileText },
  { href: '/admin/help', label: 'Help Articles', icon: BookOpen },
  { href: '/admin/support', label: 'Support Queue', icon: LifeBuoy },
  { href: '/admin/users', label: 'User Directory', icon: Users },
  { href: '/admin/media', label: 'Media Library', icon: Image },
  { href: '/admin/settings', label: 'Portal Config', icon: Sliders },
  { href: '/admin/audit', label: 'Audit Trail', icon: Shield },
];

export function AdminSidebar({ context }: AdminSidebarProps) {
  const pathname = usePathname();

  const isLinkActive = (href: string, exact?: boolean): boolean => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <aside
      aria-label="Admin Navigation Sidebar"
      className="hidden lg:flex w-64 border-r border-zinc-800/80 bg-zinc-950 p-6 pb-12 flex-col justify-between shrink-0 sticky top-0 h-screen overflow-y-auto"
    >
      <div className="space-y-6">
        {/* Portal Branding & Identity Header */}
        <div className="flex items-center gap-3 px-1">
          <div className="w-10 h-10 rounded-xl bg-indigo-950/80 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="font-bold text-sm text-zinc-100 flex items-center gap-1.5">
              <span>Admin Portal</span>
              <Badge variant="warning" className="text-[10px] px-1.5 py-0.5 font-mono uppercase">
                {context.role}
              </Badge>
            </div>
            <div className="text-[11px] text-zinc-400 truncate max-w-[140px]" title={context.email}>
              {context.email}
            </div>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="space-y-1 text-xs font-medium" aria-label="Desktop Admin Navigation">
          {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
            const active = isLinkActive(href, exact);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                  active
                    ? 'bg-indigo-950/70 border border-indigo-500/40 text-indigo-200 shadow-sm font-semibold'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/60'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-indigo-400' : 'text-zinc-400'}`} />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Return to Main Public Site & Quick Theme Switcher */}
      <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between gap-2">
        <Link
          href={ROUTES.HOME}
          className="flex items-center gap-2 text-xs text-zinc-400 hover:text-zinc-200 transition-colors px-1 py-1 rounded-lg"
        >
          <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
          <span>Return to Site</span>
        </Link>
        <ThemePopup />
      </div>
    </aside>
  );
}
