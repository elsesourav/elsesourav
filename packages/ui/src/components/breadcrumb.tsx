import * as React from 'react';
import { cn } from '../lib/utils';
import { ChevronRight } from 'lucide-react';

export function Breadcrumb({ className, children, ...props }: React.HTMLAttributes<HTMLElement>) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn('flex items-center text-xs text-zinc-400', className)}
      {...props}
    >
      <ol className="flex items-center gap-1.5 flex-wrap">{children}</ol>
    </nav>
  );
}

export function BreadcrumbItem({ className, ...props }: React.LiHTMLAttributes<HTMLLIElement>) {
  return <li className={cn('inline-flex items-center gap-1.5', className)} {...props} />;
}

export function BreadcrumbSeparator({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      role="presentation"
      aria-hidden="true"
      className={cn('text-zinc-600', className)}
      {...props}
    >
      <ChevronRight className="h-3.5 w-3.5" />
    </span>
  );
}
