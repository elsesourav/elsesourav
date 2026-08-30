import * as React from 'react';
import Link from 'next/link';
import { Card, Button } from '@elsesourav/ui';
import { Headphones, ArrowRight } from 'lucide-react';

export function HelpSupportCTA() {
  return (
    <Card className="p-8 rounded-3xl border-indigo-500/30 bg-gradient-to-br from-indigo-500/10 via-[hsl(var(--card))] to-[hsl(var(--surface-subtle))] backdrop-blur-md shadow-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
            <Headphones className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-bold text-[hsl(var(--foreground))]">
              Still have questions or need technical support?
            </h3>
            <p className="text-xs text-[hsl(var(--muted-foreground))] max-w-xl leading-relaxed">
              If you can&apos;t find what you are looking for in the documentation, submit a request on
              the Support Desk to get direct assistance.
            </p>
          </div>
        </div>

        <Link href="/support" className="shrink-0">
          <Button className="w-full sm:w-auto bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary-hover))] text-[hsl(var(--primary-foreground))] text-xs font-semibold px-5 py-2.5 rounded-xl gap-1.5 shadow-lg">
            <span>Contact Support Desk</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </Link>
      </div>
    </Card>
  );
}
