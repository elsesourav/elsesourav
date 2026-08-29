import * as React from 'react';
import { cn } from '../lib/utils';
import { Label } from './label';

export interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
  required?: boolean;
  error?: string;
  description?: string;
  id?: string;
}

export function FormField({
  label,
  required,
  error,
  description,
  id,
  className,
  children,
  ...props
}: FormFieldProps) {
  const generatedId = React.useId();
  const fieldId = id || generatedId;
  const errorId = `${fieldId}-error`;
  const descriptionId = `${fieldId}-description`;

  return (
    <div className={cn('space-y-1.5 w-full', className)} {...props}>
      {label && (
        <Label htmlFor={fieldId} required={required}>
          {label}
        </Label>
      )}
      {children}
      {description && !error && (
        <p id={descriptionId} className="text-xs text-zinc-400 leading-relaxed">
          {description}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="text-xs text-rose-400 font-medium">
          {error}
        </p>
      )}
    </div>
  );
}
