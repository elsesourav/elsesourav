'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@elsesourav/ui';
import { AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react';

interface AppDetailErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AppDetailError({ error, reset }: AppDetailErrorProps) {
  React.useEffect(() => {
    console.error('App detail page error:', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-5 p-8 rounded-3xl border border-zinc-800/80 bg-zinc-900/40 backdrop-blur-xl">
        <div className="w-12 h-12 rounded-2xl bg-rose-950/60 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400">
          <AlertCircle className="w-6 h-6" />
        </div>

        <div className="space-y-1.5">
          <h2 className="text-xl font-bold text-zinc-100">Unable to display application</h2>
          <p className="text-xs text-zinc-400">
            An unexpected error occurred while rendering the application details.
          </p>
        </div>

        <div className="pt-2 flex items-center justify-center gap-3">
          <Button
            onClick={() => reset()}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Try again
          </Button>
          <Link href="/apps">
            <Button
              variant="outline"
              className="border-zinc-700 text-zinc-300 text-xs gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to catalog
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
