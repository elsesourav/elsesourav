import * as React from 'react';
import { cn } from '../lib/utils';

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export function Label({ className, required, children, ...props }: LabelProps) {
  return (
    <label
      className={cn('text-xs font-medium text-zinc-300 leading-none select-none', className)}
      {...props}
    >
      {children}
      {required && <span className="text-red-400 ml-1">*</span>}
    </label>
  );
}
