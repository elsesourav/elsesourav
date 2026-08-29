import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, Badge, Button } from '@elsesourav/ui';
import { getAppIconUrl } from '@elsesourav/media';
import type { DashboardData } from '../queries/get-dashboard-data';
import {
  Bookmark,
  Sparkles,
  Compass,
  User,
  LifeBuoy,
  ArrowUpRight,
  ArrowRight,
  Shield,
} from 'lucide-react';

interface DashboardOverviewProps {
  data: DashboardData;
}

export function DashboardOverview({ data }: DashboardOverviewProps) {
  const { user, savedAppsCount, recentSavedApps } = data;

  return (
    <div className="space-y-8">
      {/* Welcome Banner Card */}
      <div className="relative overflow-hidden rounded-3xl border border-zinc-800/80 bg-gradient-to-r from-indigo-950/40 via-zinc-900/60 to-zinc-900/40 p-6 sm:p-8 backdrop-blur-xl">
        <div className="relative z-10 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
              Welcome back
            </span>
            <Badge variant="info" className="text-[10px] px-1.5 py-0 font-mono">
              {user.role}
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-100 tracking-tight">
            Hello, {user.displayName || user.email.split('@')[0]}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed">
            Manage your personal application workspace, explore software tools, and configure your
            account preferences.
          </p>
        </div>

        {/* Subtle decorative background glow */}
        <div className="absolute right-0 top-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-indigo-600/10 blur-3xl pointer-events-none" />
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/library" className="group block focus:outline-none">
          <Card className="p-5 rounded-2xl border-zinc-800/80 bg-zinc-900/40 hover:bg-zinc-900/80 hover:border-indigo-500/40 transition-all">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-indigo-950/60 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Bookmark className="w-5 h-5" />
              </div>
              <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
            </div>
            <div className="mt-4">
              <div className="text-2xl font-bold text-zinc-100">{savedAppsCount}</div>
              <div className="text-xs text-zinc-400">Saved in Library</div>
            </div>
          </Card>
        </Link>

        <Link href="/profile" className="group block focus:outline-none">
          <Card className="p-5 rounded-2xl border-zinc-800/80 bg-zinc-900/40 hover:bg-zinc-900/80 hover:border-indigo-500/40 transition-all">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <User className="w-5 h-5" />
              </div>
              <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
            </div>
            <div className="mt-4">
              <div className="text-2xl font-bold text-zinc-100 truncate">
                {user.displayName || 'Active'}
              </div>
              <div className="text-xs text-zinc-400">Profile & Identity</div>
            </div>
          </Card>
        </Link>

        <Link href="/support/tickets" className="group block focus:outline-none">
          <Card className="p-5 rounded-2xl border-zinc-800/80 bg-zinc-900/40 hover:bg-zinc-900/80 hover:border-indigo-500/40 transition-all">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-amber-950/60 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <LifeBuoy className="w-5 h-5" />
              </div>
              <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
            </div>
            <div className="mt-4">
              <div className="text-2xl font-bold text-zinc-100">Help & Support</div>
              <div className="text-xs text-zinc-400">Tickets & Assistance</div>
            </div>
          </Card>
        </Link>
      </div>

      {/* Recent Library Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-indigo-400" /> Recent Library Applications
          </h2>
          {savedAppsCount > 0 && (
            <Link
              href="/library"
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              <span>View all ({savedAppsCount})</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          )}
        </div>

        {recentSavedApps.length === 0 ? (
          <Card className="p-8 text-center rounded-2xl border-zinc-800/80 bg-zinc-900/20 space-y-3">
            <p className="text-xs text-zinc-400">You haven't bookmarked any applications yet.</p>
            <Link href="/apps">
              <Button
                size="sm"
                variant="outline"
                className="text-xs gap-1.5 border-zinc-700 text-zinc-300"
              >
                <Compass className="w-3.5 h-3.5" /> Explore Applications
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {recentSavedApps.map((item) => {
              const iconUrl = item.app.iconUrl ? getAppIconUrl(item.app.iconUrl, 64) : null;
              return (
                <Link
                  key={item.id}
                  href={`/apps/${item.app.slug}`}
                  className="group block focus:outline-none"
                >
                  <Card className="p-4 rounded-xl border-zinc-800/80 bg-zinc-900/40 hover:bg-zinc-900 hover:border-indigo-500/40 transition-all flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-zinc-800 border border-zinc-700/50 flex items-center justify-center shrink-0">
                        {iconUrl ? (
                          <Image
                            src={iconUrl}
                            alt={item.app.name}
                            width={40}
                            height={40}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Sparkles className="w-5 h-5 text-indigo-400" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-semibold text-zinc-100 group-hover:text-white truncate">
                          {item.app.name}
                        </h4>
                        <span className="text-[10px] text-zinc-500">
                          {item.app.primaryCategory}
                        </span>
                      </div>
                    </div>
                    <ArrowUpRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-indigo-400 shrink-0" />
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
