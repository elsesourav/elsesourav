'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@elsesourav/ui';
import { AlertCircle, RotateCcw, Home } from 'lucide-react';

export default function BlogError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    // Non-sensitive client error log
  }, []);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 bg-zinc-950 text-white">
      <div className="max-w-md w-full text-center space-y-6 p-8 rounded-3xl border border-zinc-800/80 bg-zinc-900/30 backdrop-blur-xl">
        <div className="w-14 h-14 rounded-2xl bg-rose-950/60 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400">
          <AlertCircle className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold text-zinc-100">Unable to load journal articles</h2>
          <p className="text-xs text-zinc-400 leading-relaxed">
            We encountered a problem while retrieving published engineering notes. Please try refreshing.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button
            onClick={() => reset()}
            className="w-full sm:w-auto text-xs bg-indigo-600 hover:bg-indigo-500 text-white gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Try Again
          </Button>
          <Link href="/" className="w-full sm:w-auto">
            <Button
              variant="outline"
              className="w-full sm:w-auto text-xs border-zinc-800 hover:bg-zinc-800 text-zinc-300 gap-1.5"
            >
              <Home className="w-3.5 h-3.5" /> Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
