import React, { useId } from 'react';
import { Label } from './Label';
import { cn } from '@/utils/cn';

export interface FormFieldProps {
  readonly label?: React.ReactNode;
  readonly helperText?: React.ReactNode;
  readonly errorMessage?: React.ReactNode;
  readonly isRequired?: boolean;
  readonly htmlFor?: string;
  readonly className?: string;
  readonly children:
    | React.ReactNode
    | ((props: {
        id: string;
        'aria-describedby'?: string;
        isInvalid?: boolean;
      }) => React.ReactNode);
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  helperText,
  errorMessage,
  isRequired = false,
  htmlFor,
  className,
  children,
}) => {
  const generatedId = useId();
  const fieldId = htmlFor || generatedId;
  const helperId = helperText ? `${fieldId}-helper` : undefined;
  const errorId = errorMessage ? `${fieldId}-error` : undefined;
  const isInvalid = Boolean(errorMessage);

  const describedBy = [errorId, helperId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={cn('ui-form-field', isInvalid && 'has-error', className)}>
      {label && (
        <Label htmlFor={fieldId} isRequired={isRequired}>
          {label}
        </Label>
      )}

      <div className="ui-form-field__control">
        {typeof children === 'function'
          ? children({ id: fieldId, 'aria-describedby': describedBy, isInvalid })
          : children}
      </div>

      {errorMessage && (
        <div id={errorId} className="ui-form-field__error" role="alert">
          {errorMessage}
        </div>
      )}

      {!errorMessage && helperText && (
        <div id={helperId} className="ui-form-field__helper">
          {helperText}
        </div>
      )}
    </div>
  );
};
