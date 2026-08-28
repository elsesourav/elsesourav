'use client';

import * as React from 'react';
import '@elsesourav/ui/styles.css';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error('Critical Global Error:', error);
  }, [error]);

  return (
    <html lang="en" className="dark">
      <body className="bg-zinc-950 text-white min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-xl border border-red-900 bg-zinc-900 p-6 text-center space-y-4 shadow-2xl">
          <h2 className="text-2xl font-bold text-red-400">Critical Application Error</h2>
          <p className="text-sm text-zinc-400">
            A fatal error occurred at the root layout. Please refresh or try again later.
          </p>
          <button
            onClick={() => reset()}
            className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-500 transition-colors"
          >
            Reload Application
          </button>
        </div>
      </body>
    </html>
  );
}
