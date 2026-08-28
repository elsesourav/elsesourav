import React from 'react';
import { ExternalLink } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  readonly isExternal?: boolean;
  readonly showExternalIcon?: boolean;
  readonly variant?: 'default' | 'accent' | 'muted' | 'subtle';
}

export const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  (
    {
      children,
      className,
      href,
      isExternal = false,
      showExternalIcon = false,
      variant = 'default',
      target,
      rel,
      ...props
    },
    ref
  ) => {
    const isAutoExternal = isExternal || Boolean(href?.startsWith('http'));
    const safeRel = isAutoExternal ? rel || 'noopener noreferrer' : rel;
    const safeTarget = isAutoExternal ? target || '_blank' : target;

    return (
      <a
        ref={ref}
        href={href}
        target={safeTarget}
        rel={safeRel}
        className={cn('ui-link', `ui-link--${variant}`, className)}
        {...props}
      >
        <span>{children}</span>
        {isAutoExternal && showExternalIcon && (
          <ExternalLink size={12} className="ui-link__external-icon" aria-hidden="true" />
        )}
      </a>
    );
  }
);

Link.displayName = 'Link';
