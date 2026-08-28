import { Card, CardHeader, CardTitle, CardDescription, Badge } from '@elsesourav/ui';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { ROUTES } from '@elsesourav/config';

export const metadata = {
  title: 'Explore Applications',
  description: 'Catalog of developer tools, command line applications, and web software.',
};

export default function AppsCatalogPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <Link href={ROUTES.HOME} className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </Link>
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-3xl font-bold text-white">Explore Applications</h1>
        <p className="text-zinc-400">Discover performant developer utilities and web applications.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:border-zinc-700 transition-colors">
          <CardHeader>
            <div className="flex items-center justify-between mb-2">
              <Badge variant="info">Developer Tools</Badge>
              <Badge variant="outline">v1.2.0</Badge>
            </div>
            <CardTitle>Terminal Pro</CardTitle>
            <CardDescription>
              Hardware-accelerated web terminal with split panes and custom themes.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
