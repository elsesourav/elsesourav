'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input, Button } from '@elsesourav/ui';
import { Search, X, SlidersHorizontal } from 'lucide-react';

const CATEGORIES = [
  { slug: '', label: 'All Applications' },
  { slug: 'dev-tools', label: 'Dev Tools' },
  { slug: 'productivity', label: 'Productivity' },
  { slug: 'utilities', label: 'Utilities' },
  { slug: 'games', label: 'Games' },
  { slug: 'creative', label: 'Creative' },
] as const;

export function AppFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentCategory = searchParams.get('category') || '';
  const currentSearch = searchParams.get('search') || '';
  const currentSort = searchParams.get('sort') || 'sortOrder';

  const [searchVal, setSearchVal] = React.useState(currentSearch);

  // Sync state if URL changes externally
  React.useEffect(() => {
    setSearchVal(currentSearch);
  }, [currentSearch]);

  const updateFilters = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
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
    updateFilters({ search: searchVal.trim() || null });
  };

  const hasActiveFilters = Boolean(
    currentCategory || currentSearch || (currentSort && currentSort !== 'sortOrder')
  );

  return (
    <div className="space-y-4 w-full">
      {/* Top Search and Sort Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <Input
            type="text"
            placeholder="Search apps, tools, games..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="pl-9 pr-8 bg-zinc-900/60 border-zinc-800 text-sm focus:border-indigo-500 text-zinc-100 rounded-xl"
          />
          {searchVal && (
            <button
              type="button"
              onClick={() => {
                setSearchVal('');
                updateFilters({ search: null });
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 p-1"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </form>

        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-500 hidden sm:block" />
          <select
            value={currentSort}
            onChange={(e) => updateFilters({ sort: e.target.value })}
            className="bg-zinc-900/80 border border-zinc-800 text-zinc-300 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500"
            aria-label="Sort applications"
          >
            <option value="sortOrder">Featured & Ranked</option>
            <option value="newest">Newest Releases</option>
            <option value="name">Name (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
        {CATEGORIES.map((cat) => {
          const isActive = currentCategory === cat.slug;
          return (
            <button
              key={cat.slug}
              type="button"
              onClick={() => updateFilters({ category: cat.slug || null })}
              className={`px-3.5 py-1.5 rounded-full font-medium transition-all shrink-0 border ${
                isActive
                  ? 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
              }`}
            >
              {cat.label}
            </button>
          );
        })}

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/apps')}
            className="text-xs text-zinc-500 hover:text-zinc-300 px-2.5 py-1 h-auto"
          >
            Reset
          </Button>
        )}
      </div>
    </div>
  );
}
