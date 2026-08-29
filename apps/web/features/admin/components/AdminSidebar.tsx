'use client';

import { ROUTES } from '@elsesourav/config';
import type { AdminContext } from '@elsesourav/types';
import { Badge } from '@elsesourav/ui';
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
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface AdminSidebarProps {
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
  { href: '/admin/audit', label: 'Audit Trail', icon: Shield },
];

export function AdminSidebar({ context }: AdminSidebarProps) {
  const pathname = usePathname();

  const isLinkActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <aside className="w-64 border-r border-zinc-800/80 bg-zinc-950 p-6 flex flex-col justify-between hidden md:flex shrink-0 min-h-screen">
      <div className="space-y-6">
        {/* Portal Branding */}
        <div className="flex items-center gap-2.5 px-1">
          <div className="w-9 h-9 rounded-xl bg-indigo-950/80 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-sm text-zinc-100 flex items-center gap-2">
              <span>Admin Portal</span>
              <Badge variant="warning" className="text-[10px] px-1.5 py-0.5">
                {context.role}
              </Badge>
            </div>
            <div className="text-[11px] text-zinc-500 truncate max-w-[130px]">{context.email}</div>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="space-y-1 text-xs font-medium">
          {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
            const active = isLinkActive(href, exact);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
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
      </div>

      {/* Return to Main Site */}
      <div className="pt-6 border-t border-zinc-800/80 space-y-3">
        <Link
          href={ROUTES.HOME}
          className="flex items-center gap-2 text-xs text-zinc-400 hover:text-zinc-200 transition-colors px-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Public Site</span>
        </Link>
      </div>
    </aside>
  );
}
