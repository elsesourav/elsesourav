'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input, Button } from '@elsesourav/ui';
import type { CategorySummary, TagSummary, AppPlatform } from '@elsesourav/types';
import { Search, X, SlidersHorizontal, Layers, Laptop } from 'lucide-react';

interface AppDiscoveryBarProps {
  categories?: readonly CategorySummary[];
  tags?: readonly TagSummary[];
}

export function AppDiscoveryBar({ categories = [], tags = [] }: AppDiscoveryBarProps) {
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

  return (
    <div className="space-y-4 w-full" aria-label="Search and Discovery Controls">
      {/* Search Input, Platform, and Sort Select Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <Input
            type="text"
            placeholder="Search applications, tags, keywords..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="pl-9 pr-8 bg-zinc-900/60 border-zinc-800 text-sm focus:border-indigo-500 text-zinc-100 rounded-xl min-h-[42px]"
            aria-label="Search applications"
          />
          {searchVal && (
            <button
              type="button"
              onClick={() => {
                setSearchVal('');
                updateFilters({ q: null });
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 p-1 rounded-md"
              aria-label="Clear search query"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </form>

        <div className="flex items-center gap-2.5">
          {/* Platform Filter Select */}
          <div className="flex items-center gap-1.5">
            <Laptop className="w-3.5 h-3.5 text-zinc-500 hidden md:block" />
            <select
              value={currentPlatform}
              onChange={(e) => updateFilters({ platform: e.target.value || null })}
              className="bg-zinc-900/80 border border-zinc-800 text-zinc-300 text-xs rounded-xl px-3 py-2 min-h-[42px] focus:outline-none focus:border-indigo-500"
              aria-label="Filter by platform"
            >
              <option value="">All Platforms</option>
              <option value="web">Web Browser</option>
              <option value="macos">macOS</option>
              <option value="linux">Linux</option>
              <option value="windows">Windows</option>
              <option value="chrome">Chrome Extension</option>
            </select>
          </div>

          {/* Sort Select */}
          <div className="flex items-center gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-500 hidden md:block" />
            <select
              value={currentSort}
              onChange={(e) => updateFilters({ sort: e.target.value })}
              className="bg-zinc-900/80 border border-zinc-800 text-zinc-300 text-xs rounded-xl px-3 py-2 min-h-[42px] focus:outline-none focus:border-indigo-500"
              aria-label="Sort applications"
            >
              <option value="sortOrder">Featured & Ranked</option>
              <option value="newest">Newest Releases</option>
              <option value="name">Alphabetical (A-Z)</option>
              <option value="popularity">Most Popular</option>
            </select>
          </div>
        </div>
      </div>

      {/* Category Filter Carousel */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
        <button
          type="button"
          onClick={() => updateFilters({ category: null })}
          className={`px-3.5 py-1.5 rounded-full font-medium transition-all shrink-0 border ${
            !currentCategory
              ? 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/20'
              : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
          }`}
        >
          All Categories
        </button>

        {categories.map((cat) => {
          const isActive = currentCategory === cat.slug;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => updateFilters({ category: cat.slug })}
              className={`px-3.5 py-1.5 rounded-full font-medium transition-all shrink-0 border flex items-center gap-1.5 ${
                isActive
                  ? 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
              }`}
            >
              <span>{cat.name}</span>
              {cat.appCount !== undefined && cat.appCount > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-indigo-800 text-indigo-100' : 'bg-zinc-800 text-zinc-400'}`}
                >
                  {cat.appCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Popular Tags Strip */}
      {tags.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-[11px]">
          <span className="text-zinc-500 shrink-0 font-medium mr-1">Tags:</span>
          {tags.slice(0, 10).map((t) => {
            const isSelected = currentTag === t.slug;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => updateFilters({ tag: isSelected ? null : t.slug })}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all shrink-0 ${
                  isSelected
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900'
                }`}
              >
                #{t.name}
              </button>
            );
          })}
        </div>
      )}

      {/* Active Filter Badges Strip */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs" aria-label="Active filters">
          <span className="text-zinc-500 text-[11px]">Active Filters:</span>

          {currentSearch && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-800/80 text-zinc-300 border border-zinc-700/60">
              <span>Search: "{currentSearch}"</span>
              <button
                type="button"
                onClick={() => updateFilters({ q: null })}
                className="hover:text-white ml-0.5"
                aria-label="Remove search filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {currentCategory && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-800/80 text-zinc-300 border border-zinc-700/60">
              <span>Category: {currentCategory}</span>
              <button
                type="button"
                onClick={() => updateFilters({ category: null })}
                className="hover:text-white ml-0.5"
                aria-label="Remove category filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {currentPlatform && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-800/80 text-zinc-300 border border-zinc-700/60">
              <span>Platform: {currentPlatform}</span>
              <button
                type="button"
                onClick={() => updateFilters({ platform: null })}
                className="hover:text-white ml-0.5"
                aria-label="Remove platform filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {currentTag && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-800/80 text-zinc-300 border border-zinc-700/60">
              <span>Tag: #{currentTag}</span>
              <button
                type="button"
                onClick={() => updateFilters({ tag: null })}
                className="hover:text-white ml-0.5"
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
            className="text-xs text-zinc-400 hover:text-zinc-200 px-2 py-0.5 h-auto"
          >
            Clear All
          </Button>
        </div>
      )}
    </div>
  );
}
