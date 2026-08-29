'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, Badge } from '@elsesourav/ui';
import type { AdminActivityItem } from '@elsesourav/types';
import {
  Package,
  FileText,
  BookOpen,
  LifeBuoy,
  Users,
  Activity,
  ArrowUpRight,
  Clock,
} from 'lucide-react';

interface AdminRecentActivityProps {
  activities: readonly AdminActivityItem[];
}

function getActivityIcon(type: AdminActivityItem['type']) {
  switch (type) {
    case 'app':
      return <Package className="w-4 h-4 text-indigo-400" />;
    case 'blog':
      return <FileText className="w-4 h-4 text-cyan-400" />;
    case 'help':
      return <BookOpen className="w-4 h-4 text-purple-400" />;
    case 'support':
      return <LifeBuoy className="w-4 h-4 text-amber-400" />;
    default:
      return <Users className="w-4 h-4 text-emerald-400" />;
  }
}

export function AdminRecentActivity({ activities }: AdminRecentActivityProps) {
  if (activities.length === 0) {
    return (
      <Card className="p-8 text-center rounded-3xl border-zinc-800/80 bg-zinc-900/40 backdrop-blur-xl">
        <Activity className="w-8 h-8 text-zinc-500 mx-auto mb-2" />
        <h4 className="text-sm font-semibold text-zinc-200">No recent activity</h4>
        <p className="text-xs text-zinc-500 mt-1">Platform operations and tickets will appear here.</p>
      </Card>
    );
  }

  return (
    <Card className="rounded-3xl border-zinc-800/80 bg-zinc-900/40 backdrop-blur-xl">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-indigo-400" />
          <CardTitle className="text-base text-zinc-100">Recent Platform Activity</CardTitle>
        </div>
        <CardDescription className="text-xs text-zinc-400">
          Live feed of ticket triage, app releases, and engineering devlogs.
        </CardDescription>
      </CardHeader>

      <div className="p-6 pt-2 divide-y divide-zinc-800/60">
        {activities.map((item) => {
          const date = new Date(item.timestamp).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          });

          return (
            <Link
              key={item.id}
              href={item.link}
              className="flex items-start justify-between gap-4 py-3.5 first:pt-0 last:pb-0 hover:bg-zinc-900/40 -mx-3 px-3 rounded-xl transition-colors group"
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-zinc-800/80 border border-zinc-700/60 flex items-center justify-center shrink-0 mt-0.5">
                  {getActivityIcon(item.type)}
                </div>

                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h5 className="text-xs font-semibold text-zinc-200 truncate group-hover:text-indigo-300 transition-colors">
                      {item.title}
                    </h5>
                    <Badge
                      variant={item.badgeVariant || 'default'}
                      className="text-[10px] uppercase font-mono px-1.5 py-0"
                    >
                      {item.status}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-zinc-400 truncate">{item.subtitle}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 text-[11px] text-zinc-500">
                <Clock className="w-3 h-3 text-zinc-600" />
                <span>{date}</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-300 transition-colors ml-1" />
              </div>
            </Link>
          );
        })}
      </div>
    </Card>
  );
}
