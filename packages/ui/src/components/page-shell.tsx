import * as React from 'react';
import { cn } from '../lib/utils';
import { Container, ContainerProps } from './container';

export interface PageShellProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: ContainerProps['size'];
  glow?: boolean;
  padded?: boolean;
}

export function PageShell({
  size = 'lg',
  glow = false,
  padded = true,
  className,
  children,
  ...props
}: PageShellProps) {
  return (
    <div
      className={cn(
        'relative min-h-[calc(100vh-4rem)] w-full',
        padded && 'py-8 sm:py-12 lg:py-16',
        className
      )}
      {...props}
    >
      {glow && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-96 overflow-hidden flex justify-center"
        >
          <div className="w-[600px] sm:w-[900px] h-[350px] bg-gradient-to-b from-indigo-500/10 via-indigo-600/5 to-transparent blur-3xl rounded-full transform -translate-y-1/2" />
        </div>
      )}
      <Container size={size}>{children}</Container>
    </div>
  );
}
