import { Metadata } from 'next';
import Link from 'next/link';
import { Badge, Button, Card } from '@elsesourav/ui';
import { getAdminDashboardData } from '@/features/admin/queries/get-admin-dashboard';
import { AdminStatsGrid } from '@/features/admin/components/AdminStatsGrid';
import { AdminRecentActivity } from '@/features/admin/components/AdminRecentActivity';
import { Sparkles, FilePlus, LifeBuoy, AlertCircle, ArrowRight } from 'lucide-react';

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
    <div className="w-full max-w-7xl mx-auto space-y-6 sm:space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-5 sm:pb-6">
        <div className="space-y-1.5 min-w-0">
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-zinc-100 tracking-tight">
              Control Portal Dashboard
            </h1>
            <Badge variant="warning" className="text-[10px] sm:text-xs px-2 py-0.5 font-mono uppercase">
              {context.role}
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed">
            Platform metrics, software catalog releases, knowledge base, and support triage desk.
          </p>
        </div>

        {/* Quick Action Shortcuts (Responsive Grid on Mobile, Flex on Desktop) */}
        <div className="grid grid-cols-3 sm:flex sm:items-center gap-2 sm:gap-2.5 w-full sm:w-auto shrink-0">
          <Link href="/admin/apps" className="w-full sm:w-auto">
            <Button
              size="sm"
              className="w-full sm:w-auto justify-center bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-2.5 sm:px-3 py-2 gap-1.5 shadow-md shadow-indigo-600/20 rounded-xl"
            >
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden min-[480px]:inline">Apps Catalog</span>
              <span className="min-[480px]:hidden">Apps</span>
            </Button>
          </Link>

          <Link href="/admin/blog/new" className="w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              className="w-full sm:w-auto justify-center border-zinc-800 hover:bg-zinc-800 text-zinc-300 text-xs px-2.5 sm:px-3 py-2 gap-1.5 rounded-xl"
            >
              <FilePlus className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="hidden min-[480px]:inline">Write Devlog</span>
              <span className="min-[480px]:hidden">Devlog</span>
            </Button>
          </Link>

          <Link href="/admin/support" className="w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              className="w-full sm:w-auto justify-center border-zinc-800 hover:bg-zinc-800 text-zinc-300 text-xs px-2.5 sm:px-3 py-2 gap-1.5 rounded-xl"
            >
              <LifeBuoy className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="hidden min-[480px]:inline">Support Queue</span>
              <span className="min-[480px]:hidden">Support</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Operational Attention Banner (if open tickets exist) */}
      {stats.openTickets > 0 && (
        <Card className="p-3.5 sm:p-5 rounded-2xl bg-amber-950/20 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-amber-900/40 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs sm:text-sm font-semibold text-amber-200 truncate">
                Action Required: {stats.openTickets} Unresolved Support{' '}
                {stats.openTickets === 1 ? 'Ticket' : 'Tickets'}
              </h3>
              <p className="text-[11px] sm:text-xs text-amber-400/80 leading-relaxed">
                Customer inquiries and technical assistance requests are waiting for triage.
              </p>
            </div>
          </div>

          <Link href="/admin/support" className="shrink-0 w-full sm:w-auto">
            <Button
              size="sm"
              className="w-full sm:w-auto justify-center bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-xl gap-1.5 shadow-md shadow-amber-600/20"
            >
              <span>Review Tickets</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </Card>
      )}

      {/* Real Platform Telemetry & Content Stats Grid */}
      <section aria-label="Platform Telemetry Metrics">
        <AdminStatsGrid stats={stats} />
      </section>

      {/* Real Recent Platform Activity Stream */}
      <section aria-label="Recent Operational Activity Feed">
        <AdminRecentActivity activities={recentActivities} />
      </section>
    </div>
  );
}
