'use client';

import type { CategorySummary, TagSummary } from '@elsesourav/types';
import { Button } from '@elsesourav/ui';
import { Dropdown } from '@elsesourav/ui/interior';
import { Laptop, SlidersHorizontal, X } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import * as React from 'react';

const PLATFORM_ITEMS = [
  { value: '', label: 'All Platforms' },
  { value: 'web', label: 'Web Browser' },
  { value: 'macos', label: 'macOS' },
  { value: 'linux', label: 'Linux' },
  { value: 'windows', label: 'Windows' },
  { value: 'chrome', label: 'Chrome Extension' },
];

const SORT_ITEMS = [
  { value: 'sortOrder', label: 'Featured' },
  { value: 'newest', label: 'Newest Releases' },
  { value: 'name', label: 'Alphabetical' },
  { value: 'popularity', label: 'Most Popular' },
];

interface AppDiscoveryBarProps {
  categories?: readonly CategorySummary[];
  tags?: readonly TagSummary[];
  className?: string;
}

export function AppDiscoveryBar({
  categories = [],
  tags = [],
  className = '',
}: AppDiscoveryBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentCategory = searchParams.get('category') || '';
  const currentTag = searchParams.get('tag') || '';
  const currentPlatform = searchParams.get('platform') || '';
  const currentSearch = searchParams.get('q') || searchParams.get('search') || '';
  const currentSort = searchParams.get('sort') || 'sortOrder';

  const updateFilters = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('search');

    Object.entries(updates).forEach(([key, val]) => {
      if (val === null || val === '') {
        params.delete(key);
      } else {
        params.set(key, val);
      }
    });

    // Reset pagination on filter change
    params.delete('page');

    const qs = params.toString();
    router.push(qs ? `/apps?${qs}` : '/apps');
  };

  const hasActiveFilters = Boolean(
    currentCategory ||
    currentTag ||
    currentPlatform ||
    currentSearch ||
    (currentSort && currentSort !== 'sortOrder')
  );

  // Curated domain topic ordering (Games, AI, Automation, Simulations, Tools, Web Apps, Open Source, etc.)
  const displayedTopics = React.useMemo(() => {
    const PRIORITY_SLUGS = [
      'games',
      'ai',
      'automation',
      'simulations',
      'tools',
      'web-apps',
      'open-source',
      'iot',
    ];
    const HIDDEN_TECH_SLUGS = new Set([
      'algorithms',
      'cpp',
      'canvas',
      'chrome-extension',
      'embedded',
      'expo',
      'firebase',
      'react',
      'typescript',
      'tailwindcss',
      'webassembly',
      'supabase',
      'react-native',
    ]);

    const tagBySlug = new Map(tags.map((t) => [t.slug, t]));
    const result: TagSummary[] = [];
    const seen = new Set<string>();

    // 1. Add prioritized domain topics if present
    for (const slug of PRIORITY_SLUGS) {
      const found = tagBySlug.get(slug);
      if (found) {
        result.push(found);
        seen.add(slug);
      }
    }

    // 2. If an active tag is not in priority list, ensure it appears so user can toggle it off
    if (currentTag && !seen.has(currentTag)) {
      const activeTag = tagBySlug.get(currentTag) || {
        id: currentTag,
        name: currentTag.charAt(0).toUpperCase() + currentTag.slice(1).replace(/-/g, ' '),
        slug: currentTag,
      };
      result.push(activeTag);
      seen.add(currentTag);
    }

    // 3. Fill remaining slots with other domain topics (excluding tech stack tags)
    for (const t of tags) {
      if (!seen.has(t.slug) && !HIDDEN_TECH_SLUGS.has(t.slug)) {
        result.push(t);
        seen.add(t.slug);
      }
    }

    return result.slice(0, 8);
  }, [tags, currentTag]);

  return (
    <div
      className={`w-full space-y-2.5 sm:space-y-3.5 ${className}`}
      aria-label="App Discovery and Filter Controls"
    >
      {/* 1. Category Filter Pills (Horizontal scrollable, like Update Section) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
        <Button
          type="button"
          variant={!currentCategory ? 'primary' : 'outline'}
          size="xs"
          onClick={() => updateFilters({ category: null })}
          className="rounded-full px-2.5 sm:px-3.5 py-1 sm:py-1.5 text-xs shrink-0"
        >
          All Applications
        </Button>

        {categories.map((cat) => {
          const isActive = currentCategory === cat.slug;
          return (
            <Button
              key={cat.id}
              type="button"
              variant={isActive ? 'primary' : 'outline'}
              size="xs"
              onClick={() => updateFilters({ category: cat.slug })}
              className="rounded-full px-2.5 sm:px-3.5 py-1 sm:py-1.5 text-xs shrink-0"
              rightIcon={
                cat.appCount !== undefined && cat.appCount > 0 ? (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isActive
                        ? 'bg-indigo-900 text-indigo-100'
                        : 'bg-[hsl(var(--surface))] text-[hsl(var(--muted-foreground))]'
                    }`}
                  >
                    {cat.appCount}
                  </span>
                ) : undefined
              }
            >
              {cat.name}
            </Button>
          );
        })}
      </div>

      {/* 2. Platform Dropdown, Sort Dropdown & Topics Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 pt-1 border-t border-[hsl(var(--border-subtle))]">
        {/* Curated Popular Topics Strip */}
        {displayedTopics.length > 0 && (
          <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto pb-0.5 no-scrollbar text-[10px] sm:text-[11px] min-w-0">
            <span className="text-[hsl(var(--subtle-foreground))] shrink-0 font-medium mr-0.5 sm:mr-1 font-mono text-[9px] sm:text-[10px] uppercase tracking-wider">
              Topics:
            </span>
            {displayedTopics.map((t) => {
              const isSelected = currentTag === t.slug;
              return (
                <Button
                  key={t.id}
                  type="button"
                  variant={isSelected ? 'subtle' : 'ghost'}
                  size="xs"
                  onClick={() => updateFilters({ tag: isSelected ? null : t.slug })}
                  className={`rounded-full px-2 sm:px-2.5 py-0.5 text-[10px] sm:text-[11px] shrink-0 ${
                    isSelected
                      ? 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 border border-indigo-500/40 shadow-sm'
                      : ''
                  }`}
                >
                  #{t.name}
                </Button>
              );
            })}
          </div>
        )}

        {/* Dropdowns Row: Platform and Sort */}
        <div className="flex items-center gap-1.5 sm:gap-2 w-full sm:w-auto shrink-0 relative z-20">
          <div className="flex-1 sm:flex-initial sm:w-40 min-w-0">
            <Dropdown
              items={PLATFORM_ITEMS}
              value={currentPlatform}
              onChange={(val) => updateFilters({ platform: val || null })}
              icon={<Laptop className="w-3.5 h-3.5 text-[hsl(var(--muted-foreground))] shrink-0" />}
              triggerClassName="px-2.5 sm:px-3.5 h-9 sm:h-10 text-[11px] sm:text-xs"
              className="w-full"
            />
          </div>

          <div className="flex-1 sm:flex-initial sm:w-44 min-w-0">
            <Dropdown
              items={SORT_ITEMS}
              value={currentSort}
              onChange={(val) => updateFilters({ sort: val })}
              icon={
                <SlidersHorizontal className="w-3.5 h-3.5 text-[hsl(var(--muted-foreground))] shrink-0" />
              }
              triggerClassName="px-2.5 sm:px-3.5 h-9 sm:h-10 text-[11px] sm:text-xs"
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* 3. Active Filter Badges Strip */}
      {hasActiveFilters && (
        <div
          className="flex flex-wrap items-center gap-1 sm:gap-1.5 pt-1.5 sm:pt-2 border-t border-[hsl(var(--border-subtle))] text-[11px] sm:text-xs"
          aria-label="Active filters"
        >
          <span className="text-[hsl(var(--muted-foreground))] text-[10px] font-mono uppercase tracking-wider">
            Active:
          </span>

          {currentSearch && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[hsl(var(--surface-subtle))] text-[hsl(var(--foreground))] border border-[hsl(var(--border))] text-xs">
              <span className="truncate max-w-[120px]">Search: "{currentSearch}"</span>
              <button
                type="button"
                onClick={() => updateFilters({ q: null })}
                className="hover:text-indigo-600 dark:hover:text-white"
                aria-label="Remove search filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {currentCategory && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[hsl(var(--surface-subtle))] text-[hsl(var(--foreground))] border border-[hsl(var(--border))] text-xs">
              <span className="truncate max-w-[120px]">Category: {currentCategory}</span>
              <button
                type="button"
                onClick={() => updateFilters({ category: null })}
                className="hover:text-indigo-600 dark:hover:text-white"
                aria-label="Remove category filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {currentPlatform && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[hsl(var(--surface-subtle))] text-[hsl(var(--foreground))] border border-[hsl(var(--border))] text-xs">
              <span>Platform: {currentPlatform}</span>
              <button
                type="button"
                onClick={() => updateFilters({ platform: null })}
                className="hover:text-indigo-600 dark:hover:text-white"
                aria-label="Remove platform filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {currentTag && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[hsl(var(--surface-subtle))] text-[hsl(var(--foreground))] border border-[hsl(var(--border))] text-xs">
              <span>Tag: #{currentTag}</span>
              <button
                type="button"
                onClick={() => updateFilters({ tag: null })}
                className="hover:text-indigo-600 dark:hover:text-white"
                aria-label="Remove tag filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/apps')}
            className="text-xs text-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 px-2 py-0.5 h-auto ml-auto"
          >
            Clear All
          </Button>
        </div>
      )}
    </div>
  );
}
