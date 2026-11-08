'use client';

import type { AppListItem } from '@elsesourav/types';
import { AppsMorphHero } from './AppsMorphHero';

export interface AppsMorphHeroLoaderProps {
  apps?: readonly AppListItem[];
  items?: readonly AppListItem[];
  autoplayIntervalSeconds?: number;
  pauseOnHover?: boolean;
}

/**
 * Client-side wrapper that lazy-loads the AppsMorphHero with WebGL dependencies.
 * This avoids bundling ogl/gsap on the server.
 */
export function AppsMorphHeroLoader({
  apps,
  items,
  autoplayIntervalSeconds = 5,
  pauseOnHover = false,
}: AppsMorphHeroLoaderProps) {
  const appList = apps ?? items ?? [];
  if (appList.length === 0) return null;
  return (
    <AppsMorphHero
      apps={appList}
      autoplayIntervalSeconds={autoplayIntervalSeconds}
      pauseOnHover={pauseOnHover}
    />
  );
}
