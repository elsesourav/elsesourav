'use client';

import * as React from 'react';
import { Search, Globe, FileText, Layout } from 'lucide-react';
import { SearchResultItem } from './SearchResultItem';
import { SearchLoadingSkeleton, SearchEmptyHints, type SearchScope } from './SearchSkeletons';
import type {
  GlobalSearchResponse,
  GlobalSearchResult,
  GlobalSearchResultType,
} from '@elsesourav/types';

export const RESULTS_PER_GROUP = 5;

export const TYPE_CONFIG: Record<
  GlobalSearchResultType,
  { label: string; icon: typeof Search; color: string }
> = {
  project: { label: 'Apps', icon: Layout, color: 'text-indigo-400' },
  note: { label: 'Updates', icon: FileText, color: 'text-cyan-400' },
  page: { label: 'Pages', icon: Globe, color: 'text-zinc-400' },
};

export const GROUP_ORDER: GlobalSearchResultType[] = ['project', 'note', 'page'];

export type SearchState = 'empty' | 'searching' | 'results' | 'no-results' | 'error';

export interface SearchOverlayResultsProps {
  state: SearchState;
  scope: SearchScope;
  query: string;
  isScopeEmpty: boolean;
  data: GlobalSearchResponse | null;
  activeGroups: GlobalSearchResultType[];
  flatResults: GlobalSearchResult[];
  accountResults: GlobalSearchResult[];
  activeIndex: number;
  resultsRef: React.RefObject<HTMLDivElement | null>;
  onSelectResult: (url: string) => void;
  onHoverResult: (index: number) => void;
  onSelectHint: (hint: string) => void;
  onResetScope: () => void;
}

export function SearchOverlayResults({
  state,
  scope,
  query,
  isScopeEmpty,
  data,
  activeGroups,
  flatResults,
  accountResults,
  activeIndex,
  resultsRef,
  onSelectResult,
  onHoverResult,
  onSelectHint,
  onResetScope,
}: SearchOverlayResultsProps) {
  return (
    <div
      ref={resultsRef}
      className="max-h-[min(60vh,480px)] overflow-y-auto overscroll-contain"
    >
      {state === 'empty' && (
        <SearchEmptyHints scope={scope} onSelectHint={onSelectHint} />
      )}

      {state === 'searching' && <SearchLoadingSkeleton scope={scope} />}

      {/* No Results or Scoped No Results */}
      {(state === 'no-results' || isScopeEmpty) && (
        <div className="px-5 py-8 text-center space-y-2">
          <p className="text-sm font-medium text-[hsl(var(--foreground))]">
            No{' '}
            {scope === 'project'
              ? 'apps'
              : scope === 'note'
                ? 'updates'
                : scope === 'account'
                  ? 'account'
                  : 'results'}{' '}
            found for &ldquo;{query.trim()}&rdquo;
          </p>
          {scope !== 'all' ? (
            <button
              type="button"
              onClick={onResetScope}
              className="text-xs text-indigo-400 hover:text-indigo-300 underline cursor-pointer"
            >
              Search in All Content
            </button>
          ) : (
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              Try another search term.
            </p>
          )}
        </div>
      )}

      {state === 'error' && (
        <div className="px-5 py-8 text-center space-y-1.5">
          <p className="text-sm font-medium text-rose-400">Something went wrong.</p>
          <p className="text-xs text-[hsl(var(--muted-foreground))]">Please try again.</p>
        </div>
      )}

      {/* Grouped Results */}
      {state === 'results' && !isScopeEmpty && (
        <div className="py-1.5">
          {scope === 'account' ? (
            <div className="mb-1" role="group" aria-label="Account">
              <div className="px-5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                Account
              </div>
              {accountResults.map((result) => {
                const globalIdx = flatResults.indexOf(result);
                const isActive = globalIdx === activeIndex;

                return (
                  <SearchResultItem
                    key={`${result.type}-${result.url}`}
                    result={result}
                    isActive={isActive}
                    icon={Globe}
                    color="text-zinc-400"
                    onSelect={() => onSelectResult(result.url)}
                    onMouseEnter={() => onHoverResult(globalIdx)}
                  />
                );
              })}
            </div>
          ) : (
            data?.grouped &&
            activeGroups.map((type) => {
              const group = data.grouped[type];
              if (!group || group.length === 0) return null;
              const config = TYPE_CONFIG[type];
              const limitedGroup = group.slice(0, RESULTS_PER_GROUP);

              return (
                <div key={type} className="mb-1" role="group" aria-label={config.label}>
                  <div
                    className={`px-5 py-1.5 text-[11px] font-semibold uppercase tracking-wider ${config.color}`}
                  >
                    {config.label}
                  </div>

                  {limitedGroup.map((result) => {
                    const globalIdx = flatResults.indexOf(result);
                    const isActive = globalIdx === activeIndex;

                    return (
                      <SearchResultItem
                        key={`${result.type}-${result.url}`}
                        result={result}
                        isActive={isActive}
                        icon={config.icon}
                        color={config.color}
                        onSelect={() => onSelectResult(result.url)}
                        onMouseEnter={() => onHoverResult(globalIdx)}
                      />
                    );
                  })}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
