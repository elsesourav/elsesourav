import { Card, CardHeader, CardTitle, CardDescription, Badge } from '@elsesourav/ui';
import Link from 'next/link';
import { ArrowLeft, Package, FileText, LifeBuoy, Activity } from 'lucide-react';
import { ROUTES } from '@elsesourav/config';

export const metadata = {
  title: 'Admin Control Center',
  description: 'Administrative management console.',
};

export default function AdminDashboardPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <Link href={ROUTES.HOME} className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </Link>
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
            <Badge variant="warning">Staff Only</Badge>
          </div>
          <p className="text-zinc-400">Platform telemetry, application release management, and support desk.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <Package className="w-6 h-6 text-indigo-400 mb-2" />
            <CardTitle>Applications</CardTitle>
            <CardDescription>Manage software catalog releases</CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <FileText className="w-6 h-6 text-cyan-400 mb-2" />
            <CardTitle>Devlog CMS</CardTitle>
            <CardDescription>Publish engineering notes</CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <LifeBuoy className="w-6 h-6 text-emerald-400 mb-2" />
            <CardTitle>Support Desk</CardTitle>
            <CardDescription>Triage customer requests</CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <Activity className="w-6 h-6 text-amber-400 mb-2" />
            <CardTitle>Telemetry</CardTitle>
            <CardDescription>Traffic and database health</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
