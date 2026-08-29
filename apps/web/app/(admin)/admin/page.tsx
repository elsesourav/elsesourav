import { Metadata } from 'next';
import { getAdminDashboardData } from '@/features/admin/queries/get-admin-dashboard';
import { AdminStatsGrid } from '@/features/admin/components/AdminStatsGrid';
import { AdminRecentActivity } from '@/features/admin/components/AdminRecentActivity';
import { Badge, Button } from '@elsesourav/ui';
import { Sparkles } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Admin Control Center | ElseSourav',
  description: 'Administrative overview, platform telemetry, application catalog, and support desk.',
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
            <Badge variant="warning" className="text-xs">
              {context.role}
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400">
            Platform metrics, software catalog releases, knowledge base, and support triage desk.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <Link href="/admin/apps">
            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs gap-1.5 shadow-lg shadow-indigo-600/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Manage Apps</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Real Platform Stats Grid */}
      <AdminStatsGrid stats={stats} />

      {/* Real Recent Platform Activity Stream */}
      <AdminRecentActivity activities={recentActivities} />
    </div>
  );
}
