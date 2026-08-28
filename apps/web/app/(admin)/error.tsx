'use client';

import * as React from 'react';
import { Button, Card, CardHeader, CardTitle, CardDescription } from '@elsesourav/ui';
import { ShieldAlert, RefreshCw } from 'lucide-react';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error('Admin Console Error:', error);
  }, [error]);

  return (
    <div className="max-w-xl mx-auto px-4 py-16">
      <Card className="border-red-900/60 bg-zinc-950/90 text-center">
        <CardHeader>
          <div className="w-12 h-12 rounded-full bg-red-950/80 border border-red-800 flex items-center justify-center mx-auto mb-3">
            <ShieldAlert className="w-6 h-6 text-red-400" />
          </div>
          <CardTitle className="text-xl">Admin Console Exception</CardTitle>
          <CardDescription className="mt-1">
            An internal error occurred while executing administrative operations.
          </CardDescription>
        </CardHeader>
        <div className="p-6 pt-0 flex justify-center">
          <Button onClick={() => reset()} variant="danger" size="sm" className="gap-2">
            <RefreshCw className="w-3.5 h-3.5" /> Re-authenticate & Retry
          </Button>
        </div>
      </Card>
    </div>
  );
}
