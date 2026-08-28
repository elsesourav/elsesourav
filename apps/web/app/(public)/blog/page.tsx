import { Card, CardHeader, CardTitle, CardDescription, Badge } from '@elsesourav/ui';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { ROUTES } from '@elsesourav/config';

export const metadata = {
  title: 'Engineering Journal & Devlogs',
  description: 'Technical notes, benchmarks, and architecture walkthroughs.',
};

export default function BlogPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <Link href={ROUTES.HOME} className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </Link>
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-3xl font-bold text-white">Engineering Journal</h1>
        <p className="text-zinc-400">Deep-dive notes on distributed systems, performance, and architecture.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="hover:border-zinc-700 transition-colors">
          <CardHeader>
            <div className="flex items-center justify-between mb-2">
              <Badge variant="info">Architecture</Badge>
              <span className="text-xs text-zinc-500">5 min read</span>
            </div>
            <CardTitle>Modern Web Architecture in 2026</CardTitle>
            <CardDescription>
              A deep dive into Next.js 15, Turborepo modular monoliths, and PostgreSQL performance.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
