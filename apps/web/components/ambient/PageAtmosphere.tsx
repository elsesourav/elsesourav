'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { AmbientBackground, type AmbientBackgroundVariant } from '@elsesourav/ui';

interface PageAtmosphereProps {
  forcedVariant?: AmbientBackgroundVariant;
}

export function PageAtmosphere({ forcedVariant }: PageAtmosphereProps) {
  const pathname = usePathname();

  const variant: AmbientBackgroundVariant = React.useMemo(() => {
    if (forcedVariant) return forcedVariant;
    if (!pathname || pathname === '/') return 'home';
    if (pathname.startsWith('/apps/')) return 'project';
    if (pathname.startsWith('/apps')) return 'apps';
    if (pathname.startsWith('/notes')) return 'notes';
    if (pathname.startsWith('/about')) return 'about';
    if (pathname.startsWith('/help')) return 'help';
    if (pathname.startsWith('/login') || pathname.startsWith('/signup') || pathname.startsWith('/forgot-password') || pathname.startsWith('/verify')) {
      return 'minimal';
    }
    return 'apps';
  }, [pathname, forcedVariant]);

  return <AmbientBackground variant={variant} />;
}

export default PageAtmosphere;
