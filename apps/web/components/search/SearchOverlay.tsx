'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { Search, X, ArrowRight, FileText, Layout, Globe } from 'lucide-react';
import { Skeleton } from '@elsesourav/ui';
import type { GlobalSearchResponse, GlobalSearchResult, GlobalSearchResultType } from '@elsesourav/types';

/** Per-category result limit */
const RESULTS_PER_GROUP = 5;

const TYPE_CONFIG: Record<GlobalSearchResultType, { label: string; icon: typeof Search; color: string }> = {
  project: { label: 'Apps', icon: Layout, color: 'text-indigo-400' },
  note: { label: 'Notes', icon: FileText, color: 'text-cyan-400' },
  page: { label: 'Pages', icon: Globe, color: 'text-zinc-400' },
};

const GROUP_ORDER: GlobalSearchResultType[] = ['project', 'note', 'page'];

interface SearchOverlayProps {
  open: boolean;
  onClose: () => void;
}

type SearchState = 'empty' | 'searching' | 'results' | 'no-results' | 'error';

export function SearchOverlay({ open, onClose }: SearchOverlayProps) {
  const router = useRouter();
  const [mounted, setMounted] = React.useState(false);
  const panelRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const resultsRef = React.useRef<HTMLDivElement>(null);
  const [query, setQuery] = React.useState('');
  const [data, setData] = React.useState<GlobalSearchResponse | null>(null);
  const [state, setState] = React.useState<SearchState>('empty');
  const [activeIndex, setActiveIndex] = React.useState(-1);
  const abortRef = React.useRef<AbortController | null>(null);

  const [isClosing, setIsClosing] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const requestClose = React.useCallback(() => {
    if (isClosing) return;
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 150);
  }, [isClosing, onClose]);

  // Focus input when overlay opens, lock body and html scroll
  React.useEffect(() => {
    if (open) {
      setIsClosing(false);
      const scrollY = window.scrollY;
      const originalBodyOverflow = document.body.style.overflow;
      const originalHtmlOverflow = document.documentElement.style.overflow;
      const originalBodyPosition = document.body.style.position;
      const originalBodyTop = document.body.style.top;
      const originalBodyWidth = document.body.style.width;

      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';

      const timeout = setTimeout(() => inputRef.current?.focus(), 40);

      return () => {
        clearTimeout(timeout);
        document.documentElement.style.overflow = originalHtmlOverflow;
        document.body.style.overflow = originalBodyOverflow;
        document.body.style.position = originalBodyPosition;
        document.body.style.top = originalBodyTop;
        document.body.style.width = originalBodyWidth;
        window.scrollTo(0, scrollY);
      };
    }
  }, [open]);

  // Handle outside click/tap to close overlay reliably everywhere
  React.useEffect(() => {
    if (!open || isClosing) return;

    const handlePointerOutside = (e: MouseEvent | TouchEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        requestClose();
      }
    };

    document.addEventListener('mousedown', handlePointerOutside);
    document.addEventListener('touchstart', handlePointerOutside, { passive: true });

    return () => {
      document.removeEventListener('mousedown', handlePointerOutside);
      document.removeEventListener('touchstart', handlePointerOutside);
    };
  }, [open, isClosing, requestClose]);

  // Reset state when closing
  React.useEffect(() => {
    if (!open) {
      setQuery('');
      setData(null);
      setState('empty');
      setActiveIndex(-1);
      setIsClosing(false);
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
    requestClose();
    setTimeout(() => {
      router.push(url);
    }, 150);
  }, [requestClose, router]);

  // Keyboard navigation
  React.useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        requestClose();
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
  }, [open, activeIndex, flatResults, requestClose, navigateTo]);

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

  if (!open || !mounted) return null;

  const modalContent = (
    <div
      className={`fixed inset-0 z-[9999] overflow-y-auto bg-black/75 backdrop-blur-md flex items-start justify-center pt-[8vh] sm:pt-[12vh] px-3 sm:px-4 ${
        isClosing ? 'animate-overlay-out' : 'animate-overlay-in'
      }`}
      onMouseDown={(e) => {
        if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
          requestClose();
        }
      }}
      onTouchStart={(e) => {
        if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
          requestClose();
        }
      }}
      onClick={(e) => {
        if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
          requestClose();
        }
      }}
    >
      {/* Search Panel Dialog */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Search ElseSourav"
        className={`relative z-[9999] w-full max-w-xl mx-auto bg-[hsl(var(--surface-overlay))] border border-[hsl(var(--border-strong))] rounded-2xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col ${
          isClosing ? 'animate-search-out' : 'animate-search-in'
        }`}
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Row — Strict fixed height (56px / h-14) to eliminate any height popping or layout shift */}
        <div className="h-14 min-h-[56px] max-h-[56px] flex items-center gap-3 px-4 sm:px-5 border-b border-[hsl(var(--border))] bg-[hsl(var(--card))] shrink-0">
          <Search className="w-5 h-5 text-[hsl(var(--muted-foreground))] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search projects, notes, and experiments..."
            className="h-full flex-1 bg-transparent text-base sm:text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] outline-none min-w-0 font-normal"
            aria-label="Search query"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
          />

          {/* Action buttons cluster with stable dimensions */}
          <div className="flex items-center gap-1.5 shrink-0">
            {query.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  inputRef.current?.focus();
                }}
                className="h-8 w-8 rounded-lg text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--surface-subtle))] transition-colors flex items-center justify-center active:scale-95 cursor-pointer"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              onClick={requestClose}
              className="hidden sm:inline-flex items-center justify-center px-2 h-7 text-[11px] font-mono text-[hsl(var(--subtle-foreground))] bg-[hsl(var(--surface-subtle))] border border-[hsl(var(--border))] rounded-md hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--surface-elevated))] transition-colors cursor-pointer"
              aria-label="Close search (Escape)"
            >
              Esc
            </button>

            <button
              type="button"
              onClick={requestClose}
              className="sm:hidden h-8 w-8 rounded-lg text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--surface-subtle))] transition-colors flex items-center justify-center active:scale-95 cursor-pointer"
              aria-label="Close search overlay"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
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
                {['Apps', 'Notes', 'About', 'Archive'].map((hint) => (
                  <button
                    key={hint}
                    type="button"
                    onClick={() => setQuery(hint)}
                    className="px-2.5 py-1 rounded-lg bg-[hsl(var(--surface-subtle))] border border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:border-[hsl(var(--border-strong))] transition-colors cursor-pointer"
                  >
                    {hint}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Searching State: Result-shaped skeletons */}
          {state === 'searching' && (
            <div className="py-2.5 px-4 space-y-4 animate-fade-in" aria-label="Searching results">
              {/* Apps group skeleton */}
              <div className="space-y-2">
                <Skeleton className="h-3 w-14 rounded" />
                <div className="flex items-center gap-3 py-1.5 px-1">
                  <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <Skeleton className="h-4 w-2/5 rounded" />
                    <Skeleton className="h-3 w-3/5 rounded" />
                  </div>
                </div>
                <div className="flex items-center gap-3 py-1.5 px-1">
                  <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <Skeleton className="h-4 w-1/2 rounded" />
                    <Skeleton className="h-3 w-2/3 rounded" />
                  </div>
                </div>
              </div>

              {/* Notes group skeleton */}
              <div className="space-y-2 pt-2 border-t border-[hsl(var(--border-subtle))]">
                <Skeleton className="h-3 w-14 rounded" />
                <div className="flex items-center gap-3 py-1.5 px-1">
                  <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <Skeleton className="h-4 w-3/5 rounded" />
                    <Skeleton className="h-3 w-4/5 rounded" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* No Results */}
          {state === 'no-results' && (
            <div className="px-5 py-8 text-center space-y-1.5">
              <p className="text-sm font-medium text-[hsl(var(--foreground))]">
                No results for &ldquo;{query.trim()}&rdquo;
              </p>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                Try another search term.
              </p>
            </div>
          )}

          {/* Error */}
          {state === 'error' && (
            <div className="px-5 py-8 text-center space-y-1.5">
              <p className="text-sm font-medium text-rose-400">
                Something went wrong.
              </p>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                Please try again.
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
                          className={`w-full flex items-center gap-3 px-5 py-2.5 text-left transition-colors group min-h-[44px] cursor-pointer ${
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

  return createPortal(modalContent, document.body);
}

export default SearchOverlay;
