'use client';

import dynamic from 'next/dynamic';
import type { AppListItem } from '@elsesourav/types';

const AppsMorphHero = dynamic(
  () => import('./AppsMorphHero').then((m) => m.AppsMorphHero),
  { ssr: false }
);

export interface AppsMorphHeroLoaderProps {
  apps?: readonly AppListItem[];
  items?: readonly AppListItem[];
}

/**
 * Client-side wrapper that lazy-loads the AppsMorphHero with WebGL dependencies.
 * This avoids bundling ogl/gsap on the server.
 */
export function AppsMorphHeroLoader({ apps, items }: AppsMorphHeroLoaderProps) {
  const appList = apps ?? items ?? [];
  if (appList.length === 0) return null;
  return <AppsMorphHero apps={appList} />;
}
