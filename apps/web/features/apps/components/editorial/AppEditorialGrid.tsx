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
  // Organize catalog into organized blocks where 1 portrait card height = (16:9 * 2) + gap
  const { blocks, remaining } = React.useMemo(() => {
    if (!apps || apps.length === 0) {
      return { blocks: [], remaining: [] };
    }

    const portraits: AppListItem[] = [];
    const landscapes: AppListItem[] = [];

    apps.forEach((app) => {
      if (resolveAppOrientation(app) === 'portrait') {
        portraits.push(app);
      } else {
        landscapes.push(app);
      }
    });

    const resultBlocks: EditorialBlock[] = [];
    let pIdx = 0;
    let lIdx = 0;

    // Pair 1 portrait with 2 landscapes so portrait height matches 16:9 * 2 + gap
    while (pIdx < portraits.length && lIdx + 1 < landscapes.length) {
      const p = portraits[pIdx++];
      const l1 = landscapes[lIdx++];
      const l2 = landscapes[lIdx++];
      if (!p || !l1 || !l2) break;

      const portraitOnLeft = resultBlocks.length % 2 === 0;
      resultBlocks.push({
        id: `block-${p.id || p.slug}`,
        portrait: p,
        landscapes: [l1, l2],
        portraitOnLeft,
      });
    }

    // Remaining items (if any)
    const leftover: AppListItem[] = [];
    while (pIdx < portraits.length) {
      const p = portraits[pIdx++];
      if (p) leftover.push(p);
    }
    while (lIdx < landscapes.length) {
      const l = landscapes[lIdx++];
      if (l) leftover.push(l);
    }

    return { blocks: resultBlocks, remaining: leftover };
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
                {/* Left: 1 Portrait Card stretching to 16:9 * 2 + gap */}
                <div className="w-full h-full min-w-0">
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

                {/* Right on desktop: 1 Portrait Card stretching to 16:9 * 2 + gap */}
                <div className="order-1 md:order-2 w-full h-full min-w-0">
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

      {/* Remaining items rendered in balanced grid if any */}
      {remaining.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-5 md:gap-6 items-start w-full min-w-0">
          {remaining.map((app) => (
            <AppEditorialCard key={app.id || app.slug} app={app} priority={false} />
          ))}
        </div>
      )}
    </div>
  );
}
