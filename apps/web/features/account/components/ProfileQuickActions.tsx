import * as React from 'react';
import Link from 'next/link';
import { Pencil, Lock, LifeBuoy } from 'lucide-react';

const ACTIONS = [
  {
    title: 'Edit Profile',
    subtitle: 'Update personal details, bio, avatar, links',
    href: '/settings?tab=profile',
    icon: Pencil,
    borderColor: 'border-indigo-500/25 hover:border-indigo-500/60',
    shadowColor: 'hover:shadow-indigo-500/15',
    iconBg: 'bg-indigo-500/15 border-indigo-500/30 text-indigo-400',
    hoverText: 'group-hover:text-indigo-300',
  },
  {
    title: 'Password & Security',
    subtitle: 'Manage password, 2FA, login sessions',
    href: '/settings?tab=security',
    icon: Lock,
    borderColor: 'border-purple-500/25 hover:border-purple-500/60',
    shadowColor: 'hover:shadow-purple-500/15',
    iconBg: 'bg-purple-500/15 border-purple-500/30 text-purple-400',
    hoverText: 'group-hover:text-purple-300',
  },
  {
    title: 'Help & Support',
    subtitle: 'Get assistance, contact support, tickets',
    href: '/support/tickets',
    icon: LifeBuoy,
    borderColor: 'border-sky-500/25 hover:border-sky-500/60',
    shadowColor: 'hover:shadow-sky-500/15',
    iconBg: 'bg-sky-500/15 border-sky-500/30 text-sky-400',
    hoverText: 'group-hover:text-sky-300',
  },
] as const;

export function ProfileQuickActions() {
  return (
    <div className="space-y-4">
      <h3 className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider">
        Profile Settings
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.href}
              href={action.href}
              className={`group relative p-6 rounded-2xl bg-zinc-950/70 border shadow-lg backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 active:scale-[0.98] flex flex-col gap-4 ${action.borderColor} ${action.shadowColor}`}
            >
              <div className={`w-12 h-12 rounded-xl border flex items-center justify-center group-hover:scale-110 transition-transform duration-200 ${action.iconBg}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className={`font-bold text-zinc-100 text-sm sm:text-base transition-colors ${action.hoverText}`}>
                  {action.title}
                </h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {action.subtitle}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
