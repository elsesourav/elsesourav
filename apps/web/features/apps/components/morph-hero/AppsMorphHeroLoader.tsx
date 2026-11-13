'use client';

import type { AppListItem, CarouselSlide } from '@elsesourav/types';
import { AppsMorphHero } from './AppsMorphHero';

export interface AppsMorphHeroLoaderProps {
  slides?: readonly CarouselSlide[];
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
  slides,
  apps,
  items,
  autoplayIntervalSeconds = 5,
  pauseOnHover = false,
}: AppsMorphHeroLoaderProps) {
  const slideList = slides ?? [];
  const appList = apps ?? items ?? [];

  if (slideList.length === 0 && appList.length === 0) return null;

  return (
    <AppsMorphHero
      slides={slideList.length > 0 ? slideList : undefined}
      apps={appList.length > 0 ? appList : undefined}
      autoplayIntervalSeconds={autoplayIntervalSeconds}
      pauseOnHover={pauseOnHover}
    />
  );
}
