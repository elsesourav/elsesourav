'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input, Button } from '@elsesourav/ui';
import { Dropdown } from '@elsesourav/ui/interior';
import type { CategorySummary, TagSummary, AppPlatform } from '@elsesourav/types';
import { Search, X, SlidersHorizontal, Layers, Laptop } from 'lucide-react';

const PLATFORM_ITEMS = [
  { value: '', label: 'All Platforms' },
  { value: 'web', label: 'Web Browser' },
  { value: 'macos', label: 'macOS' },
  { value: 'linux', label: 'Linux' },
  { value: 'windows', label: 'Windows' },
  { value: 'chrome', label: 'Chrome Extension' },
];

const SORT_ITEMS = [
  { value: 'sortOrder', label: 'Featured & Ranked' },
  { value: 'newest', label: 'Newest Releases' },
  { value: 'name', label: 'Alphabetical (A-Z)' },
  { value: 'popularity', label: 'Most Popular' },
];

interface AppDiscoveryBarProps {
  categories?: readonly CategorySummary[];
  tags?: readonly TagSummary[];
  showCategoryPills?: boolean;
}

export function AppDiscoveryBar({
  categories = [],
  tags = [],
  showCategoryPills = true,
}: AppDiscoveryBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentCategory = searchParams.get('category') || '';
  const currentTag = searchParams.get('tag') || '';
  const currentPlatform = searchParams.get('platform') || '';
  const currentSearch = searchParams.get('q') || searchParams.get('search') || '';
  const currentSort = searchParams.get('sort') || 'sortOrder';

  const [searchVal, setSearchVal] = React.useState(currentSearch);

  React.useEffect(() => {
    setSearchVal(currentSearch);
  }, [currentSearch]);

  const updateFilters = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    // Remove search aliases
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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ q: searchVal.trim() || null });
  };

  const hasActiveFilters = Boolean(
    currentCategory ||
    currentTag ||
    currentPlatform ||
    currentSearch ||
    (currentSort && currentSort !== 'sortOrder')
  );

  const categoryItems = React.useMemo(() => {
    return [
      { value: '', label: 'All Categories' },
      ...categories.map((cat) => ({
        value: cat.slug,
        label:
          cat.appCount !== undefined && cat.appCount > 0
            ? `${cat.name} (${cat.appCount})`
            : cat.name,
      })),
    ];
  }, [categories]);

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
    <div className="space-y-4 w-full" aria-label="Search and Discovery Controls">
      {/* Search Input, Platform, and Sort Select Bar */}
      <div className="space-y-2.5">
        <form onSubmit={handleSearchSubmit} className="relative w-full">
          <Search className="w-4 h-4 text-[hsl(var(--muted-foreground))] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <Input
            type="text"
            placeholder="Search applications, tags, keywords..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="pl-9 pr-8 bg-[hsl(var(--surface-subtle))] border-[hsl(var(--input))] text-sm focus:border-indigo-500 text-[hsl(var(--foreground))] rounded-xl min-h-[40px] w-full"
            aria-label="Search applications"
          />
          {searchVal && (
            <button
              type="button"
              onClick={() => {
                setSearchVal('');
                updateFilters({ q: null });
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] p-1 rounded-md"
              aria-label="Clear search query"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </form>

        {/* Category Dropdown Filter */}
        {categories.length > 0 && (
          <div className="w-full">
            <Dropdown
              items={categoryItems}
              value={currentCategory}
              onChange={(val) => updateFilters({ category: val || null })}
              icon={<Layers className="w-3.5 h-3.5 text-[hsl(var(--muted-foreground))]" />}
              className="w-full"
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 w-full">
          {/* Platform Filter Dropdown */}
          <div className="min-w-0">
            <Dropdown
              items={PLATFORM_ITEMS}
              value={currentPlatform}
              onChange={(val) => updateFilters({ platform: val || null })}
              icon={<Laptop className="w-3.5 h-3.5 text-[hsl(var(--muted-foreground))]" />}
              className="w-full"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="min-w-0">
            <Dropdown
              items={SORT_ITEMS}
              value={currentSort}
              onChange={(val) => updateFilters({ sort: val })}
              icon={<SlidersHorizontal className="w-3.5 h-3.5 text-[hsl(var(--muted-foreground))]" />}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Curated Popular Topics Strip */}
      {displayedTopics.length > 0 && (
        <div className="space-y-1.5 pt-1">
          <div className="text-[11px] font-mono text-[hsl(var(--muted-foreground))] uppercase tracking-wider font-semibold">
            Topics
          </div>
          <div className="flex flex-wrap items-center gap-1 text-[11px]">
            {displayedTopics.map((t) => {
              const isSelected = currentTag === t.slug;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => updateFilters({ tag: isSelected ? null : t.slug })}
                  className={`px-2.5 py-0.5 rounded-full font-medium transition-all shrink-0 border text-[11px] ${
                    isSelected
                      ? 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 border-indigo-500/40 shadow-sm'
                      : 'bg-[hsl(var(--surface-subtle))] border-[hsl(var(--border-subtle))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))]'
                  }`}
                >
                  {t.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Active Filter Badges Strip */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-[hsl(var(--border-subtle))] text-xs" aria-label="Active filters">
          <span className="text-[hsl(var(--muted-foreground))] text-[10px] font-mono uppercase tracking-wider">
            Active:
          </span>

          {currentSearch && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[hsl(var(--surface-subtle))] text-[hsl(var(--foreground))] border border-[hsl(var(--border))] text-xs">
              <span className="truncate max-w-[120px]">"{currentSearch}"</span>
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
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[hsl(var(--surface-subtle))] text-[hsl(var(--foreground))] border border-[hsl(var(--border))] text-xs">
              <span className="truncate max-w-[120px]">{currentCategory}</span>
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
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[hsl(var(--surface-subtle))] text-[hsl(var(--foreground))] border border-[hsl(var(--border))] text-xs">
              <span>{currentPlatform}</span>
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
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[hsl(var(--surface-subtle))] text-[hsl(var(--foreground))] border border-[hsl(var(--border))] text-xs">
              <span>#{currentTag}</span>
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
