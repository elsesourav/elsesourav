import { Metadata } from 'next';
import { getAdminDashboardData } from '@/features/admin/queries/get-admin-dashboard';
import { AdminStatsGrid } from '@/features/admin/components/AdminStatsGrid';
import { AdminRecentActivity } from '@/features/admin/components/AdminRecentActivity';
import { Badge, Button, Card } from '@elsesourav/ui';
import { Sparkles, FilePlus, LifeBuoy, AlertCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Admin Control Center | ElseSourav',
  description:
    'Administrative overview, platform telemetry, application catalog, and support desk.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminDashboardPage() {
  const { context, stats, recentActivities } = await getAdminDashboardData();

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-100 tracking-tight">
              Control Portal Dashboard
            </h1>
            <Badge variant="warning" className="text-xs px-2 py-0.5 font-mono">
              {context.role}
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400">
            Platform metrics, software catalog releases, knowledge base, and support triage desk.
          </p>
        </div>

        {/* Quick Action Shortcuts */}
        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          <Link href="/admin/apps">
            <Button
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs gap-1.5 shadow-lg shadow-indigo-600/20 rounded-xl"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Catalog</span>
            </Button>
          </Link>
          <Link href="/admin/blog/new">
            <Button
              variant="outline"
              size="sm"
              className="border-zinc-800 hover:bg-zinc-800 text-zinc-300 text-xs gap-1.5 rounded-xl"
            >
              <FilePlus className="w-3.5 h-3.5 text-cyan-400" />
              <span>Write Devlog</span>
            </Button>
          </Link>
          <Link href="/admin/support">
            <Button
              variant="outline"
              size="sm"
              className="border-zinc-800 hover:bg-zinc-800 text-zinc-300 text-xs gap-1.5 rounded-xl"
            >
              <LifeBuoy className="w-3.5 h-3.5 text-amber-400" />
              <span>Support Queue</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Operational Attention Banner (if open tickets exist) */}
      {stats.openTickets > 0 && (
        <Card className="p-4 sm:p-5 rounded-2xl bg-amber-950/20 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-900/40 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-semibold text-amber-200">
                Action Required: {stats.openTickets} Unresolved Support{' '}
                {stats.openTickets === 1 ? 'Ticket' : 'Tickets'}
              </h3>
              <p className="text-[11px] sm:text-xs text-amber-400/80">
                Customer inquiries and technical assistance requests are waiting for triage.
              </p>
            </div>
          </div>

          <Link href="/admin/support" className="shrink-0 self-start sm:self-auto">
            <Button
              size="sm"
              className="bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-xl gap-1.5 shadow-md shadow-amber-600/20"
            >
              <span>Review Tickets</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </Card>
      )}

      {/* Real Platform Telemetry & Content Stats Grid */}
      <section aria-label="Platform Metrics">
        <AdminStatsGrid stats={stats} />
      </section>

      {/* Real Recent Platform Activity Stream */}
      <section aria-label="Recent Operational Activity">
        <AdminRecentActivity activities={recentActivities} />
      </section>
    </div>
  );
}
