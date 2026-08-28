import { Card, CardHeader, CardTitle, CardDescription } from '@elsesourav/ui';
import Link from 'next/link';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { ROUTES } from '@elsesourav/config';

export const metadata = {
  title: 'Help Center & Documentation',
  description: 'Guides, tutorials, and troubleshooting for ElseSourav software.',
};

export default function HelpPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <Link href={ROUTES.HOME} className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </Link>
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-3xl font-bold text-white">Help Center & Knowledge Base</h1>
        <p className="text-zinc-400">Documentation and answers to common technical questions.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:border-zinc-700 transition-colors">
          <CardHeader>
            <BookOpen className="w-6 h-6 text-indigo-400 mb-2" />
            <CardTitle>Getting Started</CardTitle>
            <CardDescription>
              Basic setup instructions and introduction to ElseSourav software.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
