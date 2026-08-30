'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, ArrowRight, Loader2, FileText, Beaker, Layout, Globe } from 'lucide-react';
import type { GlobalSearchResponse, GlobalSearchResult, GlobalSearchResultType } from '@elsesourav/types';

/** Per-category result limit */
const RESULTS_PER_GROUP = 5;

const TYPE_CONFIG: Record<GlobalSearchResultType, { label: string; icon: typeof Search; color: string }> = {
  project: { label: 'Projects', icon: Layout, color: 'text-indigo-400' },
  lab: { label: 'Lab', icon: Beaker, color: 'text-purple-400' },
  note: { label: 'Notes', icon: FileText, color: 'text-cyan-400' },
  page: { label: 'Pages', icon: Globe, color: 'text-zinc-400' },
};

const GROUP_ORDER: GlobalSearchResultType[] = ['project', 'lab', 'note', 'page'];

interface SearchOverlayProps {
  open: boolean;
  onClose: () => void;
}

type SearchState = 'empty' | 'searching' | 'results' | 'no-results' | 'error';

export function SearchOverlay({ open, onClose }: SearchOverlayProps) {
  const router = useRouter();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const resultsRef = React.useRef<HTMLDivElement>(null);
  const [query, setQuery] = React.useState('');
  const [data, setData] = React.useState<GlobalSearchResponse | null>(null);
  const [state, setState] = React.useState<SearchState>('empty');
  const [activeIndex, setActiveIndex] = React.useState(-1);
  const abortRef = React.useRef<AbortController | null>(null);

  // Focus input when overlay opens, lock body scroll
  React.useEffect(() => {
    if (open) {
      const timeout = setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = 'hidden';
      return () => {
        clearTimeout(timeout);
        document.body.style.overflow = '';
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [open]);

  // Reset state when closing
  React.useEffect(() => {
    if (!open) {
      setQuery('');
      setData(null);
      setState('empty');
      setActiveIndex(-1);
    }
  }, [open]);

  // Debounced search
  React.useEffect(() => {
    if (!open) return;

    const trimmed = query.trim();
    if (trimmed.length === 0) {
      setState('empty');
      setData(null);
      setActiveIndex(-1);
      return;
    }

    setState('searching');
    setActiveIndex(-1);

    // Cancel previous request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`, {
          signal: controller.signal,
        });

        if (!res.ok) throw new Error('Search failed');

        const json: GlobalSearchResponse = await res.json();
        setData(json);
        setState(json.totalCount > 0 ? 'results' : 'no-results');
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return;
        setState('error');
      }
    }, 250);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [query, open]);

  // Build flat list for keyboard nav, with per-group limits
  const flatResults = React.useMemo(() => {
    if (!data?.grouped) return [];
    const results: GlobalSearchResult[] = [];
    for (const type of GROUP_ORDER) {
      const group = data.grouped[type];
      if (group) results.push(...group.slice(0, RESULTS_PER_GROUP));
    }
    return results;
  }, [data]);

  // Navigate to result
  const navigateTo = React.useCallback((url: string) => {
    onClose();
    router.push(url);
  }, [onClose, router]);

  // Keyboard navigation
  React.useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((prev) => {
          const next = prev < flatResults.length - 1 ? prev + 1 : 0;
          scrollResultIntoView(next);
          return next;
        });
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((prev) => {
          const next = prev > 0 ? prev - 1 : flatResults.length - 1;
          scrollResultIntoView(next);
          return next;
        });
      }

      if (e.key === 'Enter' && activeIndex >= 0 && flatResults[activeIndex]) {
        e.preventDefault();
        navigateTo(flatResults[activeIndex].url);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, activeIndex, flatResults, onClose, navigateTo]);

  // Scroll active result into view within the results container
  const scrollResultIntoView = (index: number) => {
    const container = resultsRef.current;
    if (!container) return;
    const items = container.querySelectorAll('[data-search-result]');
    const item = items[index];
    if (item) {
      item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center pt-[8vh] sm:pt-[12vh] px-3 sm:px-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Search Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search ElseSourav"
        className="relative z-10 w-full max-w-xl bg-[hsl(var(--surface-overlay))] border border-[hsl(var(--border-strong))] rounded-2xl shadow-2xl overflow-hidden animate-scale-in"
      >
        {/* Search Input Row */}
        <div className="flex items-center gap-3 px-4 sm:px-5 py-3.5 border-b border-[hsl(var(--border))]">
          <Search className="w-[18px] h-[18px] text-[hsl(var(--muted-foreground))] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search projects, notes, and experiments..."
            className="flex-1 bg-transparent text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] outline-none min-w-0"
            aria-label="Search query"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1.5 rounded-lg text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--surface-subtle))] transition-colors min-h-[28px] min-w-[28px] flex items-center justify-center"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-[hsl(var(--subtle-foreground))] bg-[hsl(var(--surface-subtle))] border border-[hsl(var(--border))] rounded-md hover:text-[hsl(var(--foreground))] transition-colors cursor-pointer"
            aria-label="Close search"
          >
            Esc
          </button>
        </div>

        {/* Results Area */}
        <div ref={resultsRef} className="max-h-[min(60vh,480px)] overflow-y-auto overscroll-contain">
          {/* Empty State — hints */}
          {state === 'empty' && (
            <div className="px-5 py-6 text-center">
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                Search projects, notes, and experiments...
              </p>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-[11px]">
                {['Work', 'Lab', 'Notes', 'About'].map((hint) => (
                  <button
                    key={hint}
                    type="button"
                    onClick={() => setQuery(hint)}
                    className="px-2.5 py-1 rounded-lg bg-[hsl(var(--surface-subtle))] border border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:border-[hsl(var(--border-strong))] transition-colors"
                  >
                    {hint}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Searching State */}
          {state === 'searching' && (
            <div className="px-5 py-8 flex items-center justify-center gap-2 text-sm text-[hsl(var(--muted-foreground))]">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Searching...</span>
            </div>
          )}

          {/* No Results */}
          {state === 'no-results' && (
            <div className="px-5 py-8 text-center space-y-1.5">
              <p className="text-sm font-medium text-[hsl(var(--foreground))]">
                No results for &ldquo;{query.trim()}&rdquo;
              </p>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                Try another search.
              </p>
            </div>
          )}

          {/* Error */}
          {state === 'error' && (
            <div className="px-5 py-8 text-center space-y-1.5">
              <p className="text-sm font-medium text-[hsl(var(--destructive))]">
                Something went wrong.
              </p>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                Try again.
              </p>
            </div>
          )}

          {/* Grouped Results */}
          {state === 'results' && data?.grouped && (
            <div className="py-1.5">
              {GROUP_ORDER.map((type) => {
                const group = data.grouped[type];
                if (!group || group.length === 0) return null;
                const config = TYPE_CONFIG[type];
                const limitedGroup = group.slice(0, RESULTS_PER_GROUP);

                return (
                  <div key={type} className="mb-1" role="group" aria-label={config.label}>
                    {/* Group Header */}
                    <div className={`px-5 py-1.5 text-[11px] font-semibold uppercase tracking-wider ${config.color}`}>
                      {config.label}
                    </div>

                    {/* Group Items */}
                    {limitedGroup.map((result) => {
                      const globalIdx = flatResults.indexOf(result);
                      const isActive = globalIdx === activeIndex;
                      const Icon = config.icon;

                      return (
                        <button
                          key={`${result.type}-${result.url}`}
                          data-search-result
                          type="button"
                          onClick={() => navigateTo(result.url)}
                          onMouseEnter={() => setActiveIndex(globalIdx)}
                          className={`w-full flex items-center gap-3 px-5 py-2.5 text-left transition-colors group min-h-[44px] ${
                            isActive
                              ? 'bg-[hsl(var(--accent))]'
                              : 'hover:bg-[hsl(var(--surface-subtle))]'
                          }`}
                          role="option"
                          aria-selected={isActive}
                          aria-label={`${result.title}${result.category ? `, ${result.category}` : ''}`}
                        >
                          {/* Icon */}
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                            isActive ? 'bg-[hsl(var(--surface-elevated))]' : 'bg-[hsl(var(--surface-subtle))]'
                          }`}>
                            <Icon className={`w-4 h-4 ${config.color}`} />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[hsl(var(--foreground))] truncate">
                              {result.title}
                            </p>
                            {result.description && (
                              <p className="text-xs text-[hsl(var(--muted-foreground))] truncate mt-0.5">
                                {result.description}
                              </p>
                            )}
                          </div>

                          {/* Category Badge */}
                          {result.category && (
                            <span className="text-[10px] font-medium text-[hsl(var(--subtle-foreground))] bg-[hsl(var(--surface-subtle))] px-2 py-0.5 rounded-md shrink-0 hidden sm:inline-flex">
                              {result.category}
                            </span>
                          )}

                          {/* Arrow indicator for active item */}
                          <ArrowRight className={`w-3.5 h-3.5 shrink-0 transition-opacity ${
                            isActive ? 'opacity-70 text-[hsl(var(--muted-foreground))]' : 'opacity-0'
                          }`} />
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer with count and keyboard hints */}
        {(state === 'results' || state === 'no-results') && (
          <div className="px-5 py-2 border-t border-[hsl(var(--border))] flex items-center justify-between text-[11px] text-[hsl(var(--subtle-foreground))]">
            <span>
              {data && data.totalCount > 0
                ? `${data.totalCount} result${data.totalCount !== 1 ? 's' : ''}`
                : '0 results'}
            </span>
            <span className="hidden sm:flex items-center gap-2">
              <span className="flex items-center gap-1">
                <kbd className="inline-flex items-center justify-center w-5 h-5 bg-[hsl(var(--surface-subtle))] border border-[hsl(var(--border))] rounded text-[10px] font-mono">↑</kbd>
                <kbd className="inline-flex items-center justify-center w-5 h-5 bg-[hsl(var(--surface-subtle))] border border-[hsl(var(--border))] rounded text-[10px] font-mono">↓</kbd>
                <span className="ml-0.5">navigate</span>
              </span>
              <span className="flex items-center gap-1">
                <kbd className="inline-flex items-center justify-center px-1.5 h-5 bg-[hsl(var(--surface-subtle))] border border-[hsl(var(--border))] rounded text-[10px] font-mono">↵</kbd>
                <span className="ml-0.5">open</span>
              </span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
