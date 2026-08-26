import React from 'react';
import { cn } from '@/utils/cn';
import './Form.css';

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  readonly isRequired?: boolean;
}

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ children, className, isRequired = false, ...props }, ref) => {
    return (
      <label ref={ref} className={cn('ui-label', className)} {...props}>
        {children}
        {isRequired && (
          <span className="ui-label__required" aria-hidden="true">
            *
          </span>
        )}
      </label>
    );
  }
);

Label.displayName = 'Label';
