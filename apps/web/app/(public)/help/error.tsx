'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@elsesourav/ui';
import { LifeBuoy, RotateCcw, Home } from 'lucide-react';

export default function HelpError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    // Client error reporting without private info
  }, []);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <div className="max-w-md w-full text-center space-y-6 p-8 rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] backdrop-blur-xl shadow-lg">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-500 dark:text-rose-400">
          <LifeBuoy className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold text-[hsl(var(--foreground))]">Unable to load help documentation</h2>
          <p className="text-xs text-[hsl(var(--muted-foreground))] leading-relaxed">
            We encountered a problem while retrieving knowledge base articles. Please try
            refreshing.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button
            onClick={() => reset()}
            className="w-full sm:w-auto text-xs bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary-hover))] text-[hsl(var(--primary-foreground))] gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Try Again
          </Button>
          <Link href="/" className="w-full sm:w-auto">
            <Button
              variant="outline"
              className="w-full sm:w-auto text-xs border-[hsl(var(--border))] hover:bg-[hsl(var(--accent))] text-[hsl(var(--foreground))] gap-1.5"
            >
              <Home className="w-3.5 h-3.5" /> Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
