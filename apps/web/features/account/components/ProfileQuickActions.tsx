'use client';

import * as React from 'react';
import Link from 'next/link';
import { User as UserIcon, Lock, LifeBuoy, ArrowRight } from 'lucide-react';

const ACTIONS = [
  {
    title: 'Edit Profile',
    subtitle: 'Update your avatar, display name, username, and bio.',
    href: '/settings?tab=profile',
    icon: UserIcon,
    iconColor: 'bg-primary/10 text-primary border-primary/20',
  },
  {
    title: 'Password & Security',
    subtitle: 'Manage your password, login credentials, and account protection.',
    href: '/settings?tab=security',
    icon: Lock,
    iconColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
  },
  {
    title: 'Help & Support',
    subtitle: 'Get technical assistance, browse guides, or track your tickets.',
    href: '/support/tickets',
    icon: LifeBuoy,
    iconColor: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
  },
] as const;

export function ProfileQuickActions() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Account Actions
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.href}
              href={action.href}
              className="group relative flex flex-col justify-between p-5 rounded-2xl bg-card text-card-foreground border border-border/80 shadow-sm hover:border-primary/40 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <div
                    className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-transform duration-200 group-hover:scale-105 ${action.iconColor}`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all duration-200" />
                </div>

                <div className="space-y-1">
                  <h3 className="font-semibold text-foreground text-sm sm:text-base group-hover:text-primary transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {action.subtitle}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
