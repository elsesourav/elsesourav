'use client';

import * as React from 'react';
import { Button } from '@elsesourav/ui';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface AppsErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AppsError({ error, reset }: AppsErrorProps) {
  React.useEffect(() => {
    // Log unexpected errors without leaking to user interface
    console.error('Apps page error:', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-5 p-8 rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] backdrop-blur-xl shadow-lg">
        <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-600 dark:text-rose-400">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <div className="space-y-1.5">
          <h2 className="text-xl font-bold text-[hsl(var(--foreground))]">Unable to load applications</h2>
          <p className="text-xs text-[hsl(var(--muted-foreground))]">
            A temporary service disruption occurred while querying the catalog. Please try again.
          </p>
        </div>

        <div className="pt-2 flex items-center justify-center gap-3">
          <Button
            onClick={() => reset()}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Try again
          </Button>
          <Button
            variant="outline"
            onClick={() => window.location.assign('/apps')}
            className="text-xs"
          >
            Reset view
          </Button>
        </div>
      </div>
    </div>
  );
}
