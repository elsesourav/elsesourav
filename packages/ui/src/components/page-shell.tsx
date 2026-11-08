import * as React from 'react';
import { cn } from '../lib/utils';
import { Container, ContainerProps } from './container';

export interface PageShellProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: ContainerProps['size'];
  glow?: boolean;
  padded?: boolean;
  containerClassName?: string;
}

export function PageShell({
  size = 'lg',
  glow = false,
  padded = true,
  className,
  containerClassName,
  children,
  ...props
}: PageShellProps) {
  return (
    <div
      className={cn(
        'relative min-h-[calc(100vh-4rem)] w-full overflow-x-clip',
        padded && 'pt-2 sm:pt-4 md:pt-5 pb-8 sm:pb-12 md:pb-16',
        className
      )}
      {...props}
    >
      {glow && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-96 overflow-hidden flex justify-center w-full"
        >
          <div className="w-full max-w-[600px] sm:max-w-[900px] h-[350px] bg-gradient-to-b from-indigo-500/10 via-indigo-600/5 to-transparent blur-3xl rounded-full transform -translate-y-1/2" />
        </div>
      )}
      <Container size={size} className={containerClassName}>{children}</Container>
    </div>
  );
}
