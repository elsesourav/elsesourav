import React from 'react';
import { cn } from '@/utils/cn';

export type TextVariant = 'body' | 'caption' | 'code' | 'lead' | 'muted';
export type TextSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type TextWeight = 'regular' | 'medium' | 'semibold' | 'bold';

export interface TextProps extends React.HTMLAttributes<HTMLElement> {
  readonly as?: 'p' | 'span' | 'div' | 'label' | 'small' | 'code';
  readonly variant?: TextVariant;
  readonly size?: TextSize;
  readonly weight?: TextWeight;
  readonly mono?: boolean;
}

export const Text = React.forwardRef<HTMLElement, TextProps>(
  (
    {
      children,
      className,
      as = 'p',
      variant = 'body',
      size = 'md',
      weight = 'regular',
      mono = false,
      ...props
    },
    ref
  ) => {
    const Component = (mono ? 'code' : as) as React.ElementType;

    return (
      <Component
        ref={ref}
        className={cn(
          'ui-text',
          `ui-text--${variant}`,
          `ui-text--${size}`,
          `ui-text--${weight}`,
          mono && 'ui-text--mono',
          className
        )}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Text.displayName = 'Text';
