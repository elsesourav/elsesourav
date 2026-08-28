'use client';

import * as React from 'react';
import { Button, Card, CardHeader, CardTitle, CardDescription } from '@elsesourav/ui';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function PublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error('Public Route Error:', error);
  }, [error]);

  return (
    <div className="max-w-xl mx-auto px-4 py-16">
      <Card className="border-red-900/40 bg-zinc-950/80 text-center">
        <CardHeader>
          <div className="w-10 h-10 rounded-full bg-red-950/60 border border-red-800 flex items-center justify-center mx-auto mb-2">
            <AlertCircle className="w-5 h-5 text-red-400" />
          </div>
          <CardTitle>Unable to Load Content</CardTitle>
          <CardDescription className="mt-1">
            An error occurred while loading this section of the catalog.
          </CardDescription>
        </CardHeader>
        <div className="p-6 pt-0 flex justify-center">
          <Button onClick={() => reset()} size="sm" variant="secondary" className="gap-2">
            <RefreshCw className="w-3.5 h-3.5" /> Try Again
          </Button>
        </div>
      </Card>
    </div>
  );
}
