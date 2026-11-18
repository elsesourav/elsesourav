'use client';

import * as React from 'react';
import Link from 'next/link';
import type { AppListItem } from '@elsesourav/types';
import { ChevronRight, Gamepad2, Sparkles, Layers, Cpu, Radio, Wrench } from 'lucide-react';
import { ShelfCarouselRow } from './ShelfCarouselRow';

export interface AppCuratedShelvesProps {
  apps: readonly AppListItem[];
  activeCategorySlug?: string;
  activeTagSlug?: string;
}

interface ShelfGroup {
  id: string;
  title: string;
  categorySlug: string;
  icon: React.ReactNode;
  subtitle: string;
  items: AppListItem[];
}

function getCategoryIcon(slug: string) {
  switch (slug) {
    case 'games':
      return <Gamepad2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />;
    case 'ai':
    case 'ai-ml':
      return <Sparkles className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />;
    case 'simulations':
      return <Layers className="w-4 h-4 text-violet-500 dark:text-violet-400" />;
    case 'automation':
      return <Cpu className="w-4 h-4 text-amber-500 dark:text-amber-400" />;
    case 'hardware':
    case 'iot':
    case 'hardware-iot':
      return <Radio className="w-4 h-4 text-cyan-500 dark:text-cyan-400" />;
    case 'tools':
    case 'utilities':
    default:
      return <Wrench className="w-4 h-4 text-blue-500 dark:text-blue-400" />;
  }
}

export function AppCuratedShelves({
  apps,
  activeCategorySlug,
  activeTagSlug,
}: AppCuratedShelvesProps) {
  // Compute curated shelves based on available apps and active filter
  const shelves = React.useMemo<ShelfGroup[]>(() => {
    if (!apps || apps.length === 0) return [];

    // If an explicit category or tag filter is active, focus the shelf on that topic
    if (activeCategorySlug) {
      const targets = activeCategorySlug.toLowerCase().split(',').map((s) => s.trim()).filter(Boolean);
      const matching = apps.filter((a) => {
        const catSlug = (a.categorySlug || '').toLowerCase();
        const catName = (a.primaryCategory || '').toLowerCase();
        const slugs = a.categorySlugs || [];
        return targets.some((t) => catSlug === t || slugs.includes(t) || catName.includes(t));
      });
      if (matching.length > 0) {
        const title =
          targets.length > 1
            ? `Filtered: ${targets.map((t) => t.charAt(0).toUpperCase() + t.slice(1).replace(/-/g, ' ')).join(', ')}`
            : activeCategorySlug === 'games'
              ? 'Games & Interactive Play'
              : matching[0]?.primaryCategory ||
                `${activeCategorySlug.charAt(0).toUpperCase() + activeCategorySlug.slice(1)} Software`;
        return [
          {
            id: activeCategorySlug,
            title,
            categorySlug: targets[0] || '',
            icon: getCategoryIcon(targets[0] || ''),
            subtitle: `Curated releases matching "${targets.join(', ')}"`,
            items: matching.slice(0, 10),
          },
        ];
      }
    }

    if (activeTagSlug) {
      const target = activeTagSlug.toLowerCase();
      const matching = apps.filter((a) => {
        const catSlug = (a.categorySlug || '').toLowerCase();
        const catName = (a.primaryCategory || '').toLowerCase();
        const shortDesc = (a.shortDescription || '').toLowerCase();
        const name = (a.name || '').toLowerCase();
        return (
          catSlug.includes(target) ||
          catName.includes(target) ||
          shortDesc.includes(target) ||
          name.includes(target)
        );
      });
      const tagTitle = activeTagSlug.charAt(0).toUpperCase() + activeTagSlug.slice(1);
      return [
        {
          id: activeTagSlug,
          title: `${tagTitle} Spotlight`,
          categorySlug: '',
          icon: getCategoryIcon(activeTagSlug),
          subtitle: `Curated releases tagged with #${activeTagSlug}`,
          items: (matching.length > 0 ? matching : [...apps]).slice(0, 10),
        },
      ];
    }

    // Default view: Strictly TOP 5 Curated Shelves (Google Play Carousel pattern)
    const shelfDefinitions = [
      {
        id: 'ai',
        title: 'Artificial Intelligence & Neural Models',
        slugs: ['ai', 'ai-ml'],
        icon: <Sparkles className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />,
        subtitle: 'Multi-modal assistants, on-device OCR, and neural classification engines',
      },
      {
        id: 'web-apps',
        title: 'Web Applications & Services',
        slugs: ['web-apps', 'web'],
        icon: <Wrench className="w-4 h-4 text-blue-500 dark:text-blue-400" />,
        subtitle: 'Production web software, real-time dashboards, and collaborative services',
      },
      {
        id: 'games',
        title: 'Games & Interactive Play',
        slugs: ['games', 'game', 'play'],
        icon: <Gamepad2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />,
        subtitle: 'WebAssembly arcade games, interactive canvases, and physics playgrounds',
      },
      {
        id: 'automation',
        title: 'Workflow & Automation',
        slugs: ['automation', 'workflow'],
        icon: <Cpu className="w-4 h-4 text-amber-500 dark:text-amber-400" />,
        subtitle: 'Marketplace bulk tools, SKU synchronizers, and productivity systems',
      },
      {
        id: 'tools',
        title: 'Developer Tools & Utilities',
        slugs: ['tools', 'utilities'],
        icon: <Wrench className="w-4 h-4 text-cyan-500 dark:text-cyan-400" />,
        subtitle: 'Microcontroller telemetry, non-destructive tools, and developer utilities',
      },
      {
        id: 'simulations',
        title: 'Algorithms & Simulations',
        slugs: ['simulations', 'simulation', 'algo'],
        icon: <Layers className="w-4 h-4 text-violet-500 dark:text-violet-400" />,
        subtitle: 'Interactive physics models, cellular automata, and algorithmic labs',
      },
      {
        id: 'hardware',
        title: 'Hardware & IoT Systems',
        slugs: ['hardware', 'hardware-iot', 'iot'],
        icon: <Radio className="w-4 h-4 text-rose-500 dark:text-rose-400" />,
        subtitle: 'Microcontroller telemetry, serial interfaces, and embedded bridges',
      },
      {
        id: 'ecommerce',
        title: 'E-Commerce & Digital Storefronts',
        slugs: ['ecommerce', 'commerce'],
        icon: <Cpu className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />,
        subtitle: 'Commerce platforms, inventory engines, and transaction systems',
      },
    ];

    const result: ShelfGroup[] = [];

    for (const def of shelfDefinitions) {
      const matches = apps.filter((a) =>
        def.slugs.some(
          (s) =>
            a.categorySlug?.toLowerCase() === s.toLowerCase() ||
            Boolean(a.categorySlugs?.includes(s.toLowerCase())) ||
            a.primaryCategory?.toLowerCase().includes(s)
        )
      );

      // If we have at least 1 app, construct the shelf with maximum 10 matching apps
      if (matches.length > 0) {
        result.push({
          id: def.id,
          title: def.title,
          categorySlug: def.slugs[0] || '',
          icon: def.icon,
          subtitle: def.subtitle,
          items: matches.slice(0, 10),
        });
      }
    }

    // Fallback if needed to guarantee top 5 shelves from the catalog
    if (result.length < 5 && apps.length > 0) {
      const existingIds = new Set(result.flatMap((s) => s.items.map((i) => i.id)));
      const remaining = apps.filter((a) => !existingIds.has(a.id));
      if (remaining.length > 0 && result.length < 5) {
        result.push({
          id: 'popular-shelf',
          title: 'Popular & Recommended Software',
          categorySlug: '',
          icon: <Sparkles className="w-4 h-4 text-indigo-400" />,
          subtitle: 'Curated software releases and interactive implementations',
          items: remaining.slice(0, 10),
        });
      }
    }

    // Strictly limit to TOP 5 shelves
    return result.slice(0, 5);
  }, [apps, activeCategorySlug, activeTagSlug]);

  if (shelves.length === 0) return null;

  return (
    <section
      aria-label="Curated software shelves"
      className="w-full max-w-full min-w-0 space-y-5 sm:space-y-7 lg:space-y-9 my-2 sm:my-4"
    >
      {shelves.map((shelf) => (
        <div key={shelf.id} className="w-full max-w-full min-w-0 space-y-2 sm:space-y-3">
          {/* Shelf Section Header */}
          <div className="flex items-center justify-between gap-2 sm:gap-3 pb-1 border-b border-[hsl(var(--border-subtle))]">
            <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
              <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-md sm:rounded-lg bg-[hsl(var(--surface-subtle))] border border-[hsl(var(--border))] flex items-center justify-center shrink-0 shadow-xs">
                {shelf.icon}
              </span>
              <div className="min-w-0">
                <h3 className="text-sm sm:text-base md:text-lg font-bold tracking-tight text-[hsl(var(--foreground))] font-display truncate">
                  {shelf.title}
                </h3>
                <p className="text-[11px] sm:text-xs text-[hsl(var(--muted-foreground))] hidden sm:block truncate">
                  {shelf.subtitle}
                </p>
              </div>
            </div>

            {shelf.categorySlug && (
              <Link
                href={`/apps?category=${shelf.categorySlug}`}
                className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 transition-colors shrink-0 group/link"
              >
                <span>See all</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 transition-transform" />
              </Link>
            )}
          </div>

          {/* Shelf Horizontal Carousel with Left/Right Buttons & Drag */}
          <ShelfCarouselRow items={shelf.items} />
        </div>
      ))}
    </section>
  );
}
