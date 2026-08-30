'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input, Button } from '@elsesourav/ui';
import type { BlogCategory, BlogTag } from '@elsesourav/types';
import { Search, X } from 'lucide-react';

interface BlogDiscoveryBarProps {
  categories?: readonly BlogCategory[];
  tags?: readonly BlogTag[];
}

export function BlogDiscoveryBar({ categories = [], tags = [] }: BlogDiscoveryBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentCategory = searchParams.get('category') || '';
  const currentTag = searchParams.get('tag') || '';
  const currentSearch = searchParams.get('q') || searchParams.get('search') || '';

  const [searchVal, setSearchVal] = React.useState(currentSearch);

  React.useEffect(() => {
    setSearchVal(currentSearch);
  }, [currentSearch]);

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

    params.delete('page');

    const qs = params.toString();
    router.push(qs ? `/notes?${qs}` : '/notes');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ q: searchVal.trim() || null });
  };

  const hasActiveFilters = Boolean(currentCategory || currentTag || currentSearch);

  return (
    <div className="space-y-4 w-full" aria-label="Blog discovery controls">
      {/* Search Input Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[hsl(var(--muted-foreground))] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <Input
            type="text"
            placeholder="Search articles by title, topic, or keyword..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="pl-9 pr-8 bg-[hsl(var(--surface-subtle))] border-[hsl(var(--input))] text-sm focus:border-indigo-500 text-[hsl(var(--foreground))] rounded-xl"
            aria-label="Search blog articles"
          />
          {searchVal && (
            <button
              type="button"
              onClick={() => {
                setSearchVal('');
                updateFilters({ q: null });
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] p-1"
              aria-label="Clear search query"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </form>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
        <button
          type="button"
          onClick={() => updateFilters({ category: null })}
          className={`px-3.5 py-1.5 rounded-full font-medium transition-all shrink-0 border ${
            !currentCategory
              ? 'bg-[hsl(var(--primary))] border-transparent text-[hsl(var(--primary-foreground))] shadow-md shadow-indigo-600/20'
              : 'bg-[hsl(var(--surface-subtle))] border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))]'
          }`}
        >
          All Topics
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
                  ? 'bg-[hsl(var(--primary))] border-transparent text-[hsl(var(--primary-foreground))] shadow-md shadow-indigo-600/20'
                  : 'bg-[hsl(var(--surface-subtle))] border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))]'
              }`}
            >
              <span>{cat.name}</span>
              {cat.postCount !== undefined && cat.postCount > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-indigo-900 text-indigo-100' : 'bg-[hsl(var(--surface))] text-[hsl(var(--muted-foreground))]'
                  }`}
                >
                  {cat.postCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Popular Topics Strip */}
      {tags.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-[11px]">
          <span className="text-[hsl(var(--subtle-foreground))] shrink-0 font-medium mr-1 font-mono text-[10px] uppercase tracking-wider">
            Topics:
          </span>
          {tags.slice(0, 8).map((t) => {
            const isSelected = currentTag === t.slug;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => updateFilters({ tag: isSelected ? null : t.slug })}
                className={`px-2.5 py-0.5 rounded-full font-medium transition-all shrink-0 border text-[11px] ${
                  isSelected
                    ? 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-300 border-cyan-500/40 shadow-sm'
                    : 'bg-[hsl(var(--surface-subtle))] border-[hsl(var(--border-subtle))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))]'
                }`}
              >
                {t.name}
              </button>
            );
          })}
        </div>
      )}

      {/* Active Filter Badges */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs" aria-label="Active filters">
          <span className="text-[hsl(var(--muted-foreground))] text-[11px]">Active:</span>

          {currentSearch && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[hsl(var(--surface-subtle))] text-[hsl(var(--foreground))] border border-[hsl(var(--border))]">
              <span>Search: "{currentSearch}"</span>
              <button
                type="button"
                onClick={() => updateFilters({ q: null })}
                className="hover:text-[hsl(var(--foreground))] text-[hsl(var(--muted-foreground))]"
                aria-label="Remove search filter"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          )}

          {currentCategory && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[hsl(var(--surface-subtle))] text-[hsl(var(--foreground))] border border-[hsl(var(--border))]">
              <span>Category: {currentCategory}</span>
              <button
                type="button"
                onClick={() => updateFilters({ category: null })}
                className="hover:text-[hsl(var(--foreground))] text-[hsl(var(--muted-foreground))]"
                aria-label="Remove category filter"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          )}

          {currentTag && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[hsl(var(--surface-subtle))] text-[hsl(var(--foreground))] border border-[hsl(var(--border))]">
              <span>Tag: #{currentTag}</span>
              <button
                type="button"
                onClick={() => updateFilters({ tag: null })}
                className="hover:text-[hsl(var(--foreground))] text-[hsl(var(--muted-foreground))]"
                aria-label="Remove tag filter"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/notes')}
            className="text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] px-2 py-0.5 h-auto"
          >
            Clear All
          </Button>
        </div>
      )}
    </div>
  );
}
