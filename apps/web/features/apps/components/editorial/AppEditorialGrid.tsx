'use client';

import * as React from 'react';
import type { AppListItem } from '@elsesourav/types';
import { AppEditorialCard, resolveAppOrientation } from './AppEditorialCard';

export interface AppEditorialGridProps {
  apps: readonly AppListItem[];
  startIndex?: number;
}

interface EditorialBlock {
  id: string;
  portrait: AppListItem;
  landscapes: [AppListItem, AppListItem];
  portraitOnLeft: boolean;
}

export function AppEditorialGrid({ apps = [], startIndex = 0 }: AppEditorialGridProps) {
  // Organize catalog into structured 3-app blocks where:
  // - 1 Portrait card (9:16 vertical space) matches the exact height of 2 stacked Landscape cards (16:9) + gap.
  // - Even blocks place Portrait on Left, Landscapes on Right (e.g. Breakout Ball + Glorov & SpectraLens).
  // - Odd blocks alternate: Landscapes on Left, Portrait on Right.
  const { blocks, remaining } = React.useMemo(() => {
    if (!apps || apps.length === 0) {
      return { blocks: [], remaining: [] };
    }

    const pool = [...apps];
    const resultBlocks: EditorialBlock[] = [];

    while (pool.length >= 3) {
      // Find an app in the lookahead window that prefers portrait orientation
      // If found, promote it into the portrait slot; otherwise use the first item.
      const lookaheadWindow = Math.min(pool.length, 6);
      let portraitIdx = -1;
      for (let i = 0; i < lookaheadWindow; i++) {
        const item = pool[i];
        if (item && resolveAppOrientation(item) === 'portrait') {
          portraitIdx = i;
          break;
        }
      }

      const portraitApp =
        portraitIdx >= 0 ? pool.splice(portraitIdx, 1)[0]! : pool.shift()!;
      const l1 = pool.shift()!;
      const l2 = pool.shift()!;

      const portraitOnLeft = resultBlocks.length % 2 === 0;
      resultBlocks.push({
        id: `block-${portraitApp.id || portraitApp.slug}-${resultBlocks.length}`,
        portrait: portraitApp,
        landscapes: [l1, l2],
        portraitOnLeft,
      });
    }

    return { blocks: resultBlocks, remaining: pool };
  }, [apps]);

  if (!apps || apps.length === 0) return null;

  return (
    <div className="w-full min-w-0 space-y-4 sm:space-y-6">
      {/* Editorial Paired Blocks (1 Portrait = 2 Landscape (16:9) + Gap) */}
      {blocks.map((block, blockIndex) => {
        const isFirstBlock = blockIndex === 0 && startIndex === 0;

        return (
          <div
            key={block.id}
            className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-5 md:gap-6 items-stretch w-full min-w-0"
          >
            {block.portraitOnLeft ? (
              <>
                {/* Left: 1 Portrait Card stretching to match 2 stacked landscape cards + gap */}
                <div className="w-full h-full min-w-0 flex flex-col">
                  <AppEditorialCard
                    app={block.portrait}
                    variant="portrait"
                    className="h-full"
                    priority={isFirstBlock}
                  />
                </div>

                {/* Right: 2 Stacked 16:9 Landscape Cards with gap */}
                <div className="flex flex-col gap-3.5 sm:gap-5 md:gap-6 w-full min-w-0">
                  <AppEditorialCard
                    app={block.landscapes[0]}
                    variant="landscape"
                    priority={isFirstBlock}
                  />
                  <AppEditorialCard
                    app={block.landscapes[1]}
                    variant="landscape"
                    priority={false}
                  />
                </div>
              </>
            ) : (
              <>
                {/* Left on desktop: 2 Stacked 16:9 Landscape Cards */}
                <div className="order-2 md:order-1 flex flex-col gap-3.5 sm:gap-5 md:gap-6 w-full min-w-0">
                  <AppEditorialCard
                    app={block.landscapes[0]}
                    variant="landscape"
                    priority={false}
                  />
                  <AppEditorialCard
                    app={block.landscapes[1]}
                    variant="landscape"
                    priority={false}
                  />
                </div>

                {/* Right on desktop: 1 Portrait Card stretching to match 2 stacked landscape cards + gap */}
                <div className="order-1 md:order-2 w-full h-full min-w-0 flex flex-col">
                  <AppEditorialCard
                    app={block.portrait}
                    variant="portrait"
                    className="h-full"
                    priority={false}
                  />
                </div>
              </>
            )}
          </div>
        );
      })}

      {/* Remaining items rendered in balanced landscape grid if any */}
      {remaining.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-5 md:gap-6 items-start w-full min-w-0">
          {remaining.map((app) => (
            <AppEditorialCard
              key={app.id || app.slug}
              app={app}
              variant="landscape"
              priority={false}
            />
          ))}
        </div>
      )}
    </div>
  );
}
