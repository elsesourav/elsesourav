import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getDashboardData } from '@/features/dashboard/queries/get-dashboard-data';
import { DashboardOverview } from '@/features/dashboard/components/DashboardOverview';
import { PageShell } from '@elsesourav/ui';

export const metadata: Metadata = {
  title: 'Dashboard | ElseSourav',
  description: 'Your central ElseSourav workspace and application dashboard.',
};

export default async function DashboardPage() {
  const data = await getDashboardData();
  if (!data) {
    redirect('/login?next=/dashboard');
  }

  return (
    <PageShell size="lg" glow>
      <div className="max-w-7xl mx-auto">
        <DashboardOverview data={data} />
      </div>
    </PageShell>
  );
}
