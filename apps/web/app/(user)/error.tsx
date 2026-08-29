'use client';

import * as React from 'react';
import { ErrorState, Button } from '@elsesourav/ui';
import Link from 'next/link';
import { ROUTES } from '@elsesourav/config';

export default function UserError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    // Non-sensitive logging
    console.error('User domain error caught:', error.message);
  }, [error]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <ErrorState
        title="Something went wrong"
        description="An error occurred while loading your account data. Please try again or return to the home screen."
        onRetry={reset}
        action={
          <Link href={ROUTES.HOME}>
            <Button variant="outline" size="sm">
              Return Home
            </Button>
          </Link>
        }
      />
    </div>
  );
}
