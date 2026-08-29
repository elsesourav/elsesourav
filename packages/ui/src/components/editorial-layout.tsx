import * as React from 'react';
import { cn } from '../lib/utils';

export interface EditorialLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  sidebar?: React.ReactNode;
  asidePosition?: 'left' | 'right';
}

export function EditorialLayout({
  sidebar,
  asidePosition = 'left',
  className,
  children,
  ...props
}: EditorialLayoutProps) {
  if (!sidebar) {
    return (
      <div className={cn('max-w-3xl mx-auto w-full', className)} {...props}>
        {children}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start w-full',
        className
      )}
      {...props}
    >
      {asidePosition === 'left' && (
        <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">{sidebar}</aside>
      )}
      <main className="lg:col-span-8 min-w-0">{children}</main>
      {asidePosition === 'right' && (
        <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">{sidebar}</aside>
      )}
    </div>
  );
}
