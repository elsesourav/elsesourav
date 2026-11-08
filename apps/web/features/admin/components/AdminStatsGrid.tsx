'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card } from '@elsesourav/ui';
import type { AdminDashboardStats } from '@elsesourav/types';
import { Package, FileText, BookOpen, LifeBuoy, Users, ArrowUpRight } from 'lucide-react';

interface AdminStatsGridProps {
  stats: AdminDashboardStats;
}

interface StatCardConfig {
  title: string;
  value: number;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  accentColor: string;
  bgColor: string;
  borderColor: string;
  alert?: string;
}

export function AdminStatsGrid({ stats }: AdminStatsGridProps) {
  const cards: readonly StatCardConfig[] = [
    {
      title: 'Applications',
      value: stats.totalApps,
      subtitle: `${stats.publishedApps} published • ${stats.draftApps} drafts`,
      icon: Package,
      href: '/admin/apps',
      accentColor: 'text-indigo-400',
      bgColor: 'bg-indigo-950/40',
      borderColor: 'border-indigo-500/30',
    },
    {
      title: 'Devlogs CMS',
      value: stats.totalBlogPosts,
      subtitle: `${stats.publishedBlogPosts} published posts`,
      icon: FileText,
      href: '/admin/blog',
      accentColor: 'text-cyan-400',
      bgColor: 'bg-cyan-950/40',
      borderColor: 'border-cyan-500/30',
    },
    {
      title: 'Help Articles',
      value: stats.totalHelpArticles,
      subtitle: 'Knowledge base documentation',
      icon: BookOpen,
      href: '/admin/help',
      accentColor: 'text-purple-400',
      bgColor: 'bg-purple-950/40',
      borderColor: 'border-purple-500/30',
    },
    {
      title: 'Support Queue',
      value: stats.openTickets,
      subtitle: `${stats.totalTickets} total tickets triage`,
      icon: LifeBuoy,
      href: '/admin/support',
      accentColor: stats.openTickets > 0 ? 'text-amber-400' : 'text-emerald-400',
      bgColor: stats.openTickets > 0 ? 'bg-amber-950/40' : 'bg-emerald-950/40',
      borderColor: stats.openTickets > 0 ? 'border-amber-500/30' : 'border-emerald-500/30',
      alert: stats.openTickets > 0 ? 'Needs Attention' : 'Queue Clean',
    },
    {
      title: 'Registered Users',
      value: stats.totalUsers,
      subtitle: 'Active community accounts',
      icon: Users,
      href: '/admin/users',
      accentColor: 'text-emerald-400',
      bgColor: 'bg-emerald-950/40',
      borderColor: 'border-emerald-500/30',
    },
  ];

  return (
    <div className="grid grid-cols-1 min-[480px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3.5 sm:gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Link key={card.title} href={card.href} className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-2xl">
            <Card className="p-3.5 sm:p-4 rounded-2xl border-zinc-800/80 bg-zinc-900/40 backdrop-blur-xl group-hover:border-zinc-700 transition-colors space-y-3 h-full flex flex-col justify-between">
              <div className="flex items-start justify-between gap-2">
                <div
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl ${card.bgColor} border ${card.borderColor} flex items-center justify-center ${card.accentColor} shrink-0`}
                >
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300 transition-colors shrink-0" />
              </div>

              <div>
                <div className="flex items-baseline justify-between gap-2 flex-wrap">
                  <div className="text-xl sm:text-2xl font-extrabold text-zinc-100 tracking-tight font-mono">
                    {card.value}
                  </div>
                  {card.alert && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium font-mono bg-amber-950/60 border border-amber-500/30 text-amber-300">
                      {card.alert}
                    </span>
                  )}
                </div>
                <h3 className="text-xs font-semibold text-zinc-200 mt-1">{card.title}</h3>
                <p className="text-[11px] text-zinc-400 mt-0.5 leading-snug">{card.subtitle}</p>
              </div>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
