import * as React from 'react';

/**
 * Root Template (Next.js 15 App Router)
 *
 * Automatically remounts on every route transition to provide a subtle,
 * high-performance, non-blocking entrance transition (.animate-page-in)
 * across all top-level and nested routes.
 */
export default function RootTemplate({ children }: { children: React.ReactNode }) {
  return (
    <div className="animate-page-in flex-1 flex flex-col w-full min-h-0">
      {children}
    </div>
  );
}
