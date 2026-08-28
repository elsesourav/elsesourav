'use client';

import * as React from 'react';
import { Button, Card, CardHeader, CardTitle, CardDescription } from '@elsesourav/ui';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    // Log unexpected errors safely to internal observability pipeline
    console.error('Unhandled Root Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-zinc-950 text-white">
      <Card className="max-w-md w-full border-red-900/50 bg-zinc-950/80 text-center">
        <CardHeader>
          <div className="w-12 h-12 rounded-full bg-red-950/80 border border-red-800 flex items-center justify-center mx-auto mb-3">
            <AlertTriangle className="w-6 h-6 text-red-400" />
          </div>
          <CardTitle className="text-xl text-white">Something Went Wrong</CardTitle>
          <CardDescription className="text-zinc-400 mt-2">
            An unexpected error occurred while loading this page. Our team has been notified.
          </CardDescription>
        </CardHeader>
        <div className="p-6 pt-0 flex justify-center">
          <Button onClick={() => reset()} variant="primary" className="gap-2">
            <RefreshCw className="w-4 h-4" /> Try Again
          </Button>
        </div>
      </Card>
    </div>
  );
}
