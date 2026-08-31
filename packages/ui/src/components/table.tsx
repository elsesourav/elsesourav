import * as React from 'react';
import { cn } from '../lib/utils';

export function Table({ className, ...props }: React.TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className="relative w-full overflow-x-auto rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-sm">
      <table className={cn('w-full caption-bottom text-sm text-left', className)} {...props} />
    </div>
  );
}

export function TableHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead
      className={cn(
        '[&_tr]:border-b [&_tr]:border-[hsl(var(--border))] bg-[hsl(var(--surface-subtle))] text-xs font-semibold text-[hsl(var(--muted-foreground))]',
        className
      )}
      {...props}
    />
  );
}

export function TableBody({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={cn('[&_tr:last-child]:border-0', className)} {...props} />;
}

export function TableRow({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={cn(
        'border-b border-[hsl(var(--border-subtle))] transition-colors hover:bg-[hsl(var(--accent))] data-[state=selected]:bg-[hsl(var(--accent))]',
        className
      )}
      {...props}
    />
  );
}

export function TableHead({
  className,
  scope = 'col',
  ...props
}: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      scope={scope}
      className={cn(
        'h-10 px-4 text-left align-middle font-medium text-[hsl(var(--muted-foreground))] whitespace-nowrap [&:has([role=checkbox])]:pr-0',
        className
      )}
      {...props}
    />
  );
}

export function TableCell({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={cn(
        'p-4 align-middle text-[hsl(var(--foreground))] break-words [&:has([role=checkbox])]:pr-0',
        className
      )}
      {...props}
    />
  );
}

export function TableCaption({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableCaptionElement>) {
  return <caption className={cn('mt-4 text-xs text-zinc-500 pb-2', className)} {...props} />;
}
