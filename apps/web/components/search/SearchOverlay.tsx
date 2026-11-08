'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { useRouter, usePathname } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { AnimatedSearchPlaceholder } from './AnimatedSearchPlaceholder';
import type { SearchScope } from './SearchSkeletons';
import { SearchOverlayScopeBar } from './SearchOverlayScopeBar';
import { SearchOverlayFooter } from './SearchOverlayFooter';
import {
  SearchOverlayResults,
  type SearchState,
  GROUP_ORDER,
  RESULTS_PER_GROUP,
} from './SearchOverlayResults';
import { searchAccountPages } from './account-pages';
import { triggerPageTransition } from '@/components/loading/PageTransitionLoader';
import type {
  GlobalSearchResponse,
  GlobalSearchResult,
  GlobalSearchResultType,
} from '@elsesourav/types';

interface SearchOverlayProps {
  open: boolean;
  onClose: () => void;
  initialScope?: SearchScope;
}

export function SearchOverlay({ open, onClose, initialScope }: SearchOverlayProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = React.useState(false);
  const panelRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const resultsRef = React.useRef<HTMLDivElement>(null);

  const getRouteScope = React.useCallback((): SearchScope => {
    if (initialScope) return initialScope;
    if (pathname.startsWith('/apps')) return 'project';
    if (pathname.startsWith('/updates')) return 'note';
    if (
      pathname.startsWith('/profile') ||
      pathname.startsWith('/settings') ||
      pathname.startsWith('/dashboard') ||
      pathname.startsWith('/library') ||
      pathname.startsWith('/notifications') ||
      pathname.startsWith('/account') ||
      pathname.startsWith('/support')
    ) {
      return 'account';
    }
    return 'all';
  }, [initialScope, pathname]);

  const [scope, setScope] = React.useState<SearchScope>(getRouteScope);
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

  // Sync contextual scope and focus input when overlay opens
  React.useEffect(() => {
    if (open) {
      setIsClosing(false);
      setScope(getRouteScope());
      const originalBodyOverflow = document.body.style.overflow;
      const savedScrollY = typeof window !== 'undefined' ? window.scrollY : 0;
      document.body.style.overflow = 'hidden';

      const timeout = setTimeout(() => {
        inputRef.current?.focus({ preventScroll: true });
      }, 40);

      return () => {
        clearTimeout(timeout);
        document.body.style.overflow = originalBodyOverflow;
        if (typeof window !== 'undefined' && window.scrollY !== savedScrollY) {
          window.scrollTo({
            top: savedScrollY,
            left: 0,
            behavior: 'instant' as ScrollBehavior,
          });
        }
      };
    }
  }, [open, getRouteScope]);

  // Handle outside click/tap
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

    if (scope === 'account') {
      const matched = searchAccountPages(trimmed);
      setState(matched.length > 0 ? 'results' : 'no-results');
      setActiveIndex(-1);
      return;
    }

    setState('searching');
    setActiveIndex(-1);

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
  }, [query, open, scope]);

  const accountResults = React.useMemo(() => {
    if (scope !== 'account') return [];
    return searchAccountPages(query);
  }, [scope, query]);

  // Active groups based on scope filter
  const activeGroups = React.useMemo<GlobalSearchResultType[]>(() => {
    if (scope === 'project') return ['project'];
    if (scope === 'note') return ['note'];
    return GROUP_ORDER;
  }, [scope]);

  // Build flat list for keyboard nav according to active scope
  const flatResults = React.useMemo(() => {
    if (scope === 'account') return accountResults;
    if (!data?.grouped) return [];
    const results: GlobalSearchResult[] = [];
    for (const type of activeGroups) {
      const group = data.grouped[type];
      if (group) results.push(...group.slice(0, RESULTS_PER_GROUP));
    }
    return results;
  }, [data, activeGroups, scope, accountResults]);

  // Navigate to result
  const navigateTo = React.useCallback(
    (url: string) => {
      requestClose();
      triggerPageTransition(url);
      setTimeout(() => {
        router.push(url);
      }, 150);
    },
    [requestClose, router]
  );

  const scrollResultIntoView = (index: number) => {
    const container = resultsRef.current;
    if (!container) return;
    const items = container.querySelectorAll('[data-search-result]');
    const item = items[index];
    if (item) {
      item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  };

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

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && query === '' && scope !== 'all') {
      e.preventDefault();
      setScope('all');
    }
  };

  if (!open || !mounted) return null;

  const isScopeEmpty = state === 'results' && flatResults.length === 0;

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
        {/* Search Input Row — Fixed 56px height */}
        <div className="h-14 min-h-[56px] max-h-[56px] flex items-center gap-2.5 px-4 sm:px-5 border-b border-[hsl(var(--border))] bg-[hsl(var(--card))] shrink-0">
          <Search className="w-5 h-5 text-[hsl(var(--muted-foreground))] shrink-0" />

          {/* Section Filter Indicator: Normal text, normal backspace to delete */}
          {scope === 'project' && (
            <span className="text-base sm:text-sm font-normal text-[hsl(var(--foreground))] shrink-0 select-none">
              Apps &gt;
            </span>
          )}

          {scope === 'note' && (
            <span className="text-base sm:text-sm font-normal text-[hsl(var(--foreground))] shrink-0 select-none">
              Updates &gt;
            </span>
          )}

          {scope === 'account' && (
            <span className="text-base sm:text-sm font-normal text-[hsl(var(--foreground))] shrink-0 select-none">
              Account &gt;
            </span>
          )}

          <div className="relative flex-1 h-full flex items-center min-w-0">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleInputKeyDown}
              className="h-full w-full bg-transparent text-base sm:text-sm text-[hsl(var(--foreground))] outline-none min-w-0 font-normal relative z-10"
              aria-label="Search query"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
            />
            {!query && (
              <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none select-none z-0">
                <AnimatedSearchPlaceholder
                  prefix="Search "
                  words={
                    scope === 'project'
                      ? ['apps', 'tools', 'games', 'systems']
                      : scope === 'note'
                        ? ['updates', 'devlogs', 'articles', 'releases']
                        : scope === 'account'
                          ? ['profile', 'security', 'settings', 'notifications', 'library']
                          : ['apps', 'updates', 'tools', 'articles', 'projects', 'experiments']
                  }
                  className="text-base sm:text-sm text-[hsl(var(--muted-foreground))]"
                />
              </div>
            )}
          </div>

          {/* Action buttons cluster */}
          <div className="flex items-center gap-1.5 shrink-0">
            {query.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  inputRef.current?.focus({ preventScroll: true });
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

        {/* Section Filter Quick Selector Strip */}
        <SearchOverlayScopeBar scope={scope} onScopeChange={setScope} />

        {/* Results Area */}
        <SearchOverlayResults
          state={state}
          scope={scope}
          query={query}
          isScopeEmpty={isScopeEmpty}
          data={data}
          activeGroups={activeGroups}
          flatResults={flatResults}
          accountResults={accountResults}
          activeIndex={activeIndex}
          resultsRef={resultsRef}
          onSelectResult={navigateTo}
          onHoverResult={setActiveIndex}
          onSelectHint={(hint) => setQuery(hint)}
          onResetScope={() => setScope('all')}
        />

        {/* Footer with count and keyboard hints */}
        {(state === 'results' || state === 'no-results' || isScopeEmpty) && (
          <SearchOverlayFooter count={flatResults.length} scope={scope} />
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

export default SearchOverlay;
