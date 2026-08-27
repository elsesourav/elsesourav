import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  X,
  Loader2,
  Package,
  BookOpen,
  HelpCircle,
  ArrowRight,
  History,
  Trash2,
} from 'lucide-react';
import { globalSearchService } from '@/services/global-search.service';
import type { GlobalSearchResultItem } from '@/types/search.types';
import {
  getRecentSearches,
  saveRecentSearch,
  removeRecentSearch,
  clearRecentSearches,
} from '@/utils/recent-searches';
import './GlobalSearchInput.css';

export interface GlobalSearchInputProps {
  readonly initialValue?: string;
  readonly placeholder?: string;
  readonly onSearch?: (query: string) => void;
  readonly showSuggestions?: boolean;
  readonly autoFocus?: boolean;
  readonly className?: string;
}

export const GlobalSearchInput: React.FC<GlobalSearchInputProps> = ({
  initialValue = '',
  placeholder = 'Search apps, engineering articles, help guides...',
  onSearch,
  showSuggestions = true,
  autoFocus = false,
  className = '',
}) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState(initialValue);
  const [suggestions, setSuggestions] = useState<readonly GlobalSearchResultItem[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const [activeAnnouncement, setActiveAnnouncement] = useState<string>('');

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestRequestIdRef = useRef<number>(0);

  // Synchronize initial value when prop changes
  useEffect(() => {
    setQuery(initialValue);
  }, [initialValue]);

  // Load recent searches on mount
  useEffect(() => {
    setRecentSearches(getRecentSearches());
  }, []);

  // Click outside to dismiss suggestions dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch suggestions with debouncing and stale request cancellation
  const fetchSuggestions = useCallback(async (searchQuery: string) => {
    const trimmed = searchQuery.trim();
    if (!trimmed || trimmed.length < 2) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    const currentRequestId = ++latestRequestIdRef.current;
    setIsLoading(true);

    const res = await globalSearchService.getSuggestions(trimmed, 6);

    // Ignore stale asynchronous response if a newer query was initiated
    if (currentRequestId !== latestRequestIdRef.current) {
      return;
    }

    if (res.success) {
      setSuggestions(res.data);
      setIsOpen(res.data.length > 0);
    } else {
      setSuggestions([]);
    }
    setIsLoading(false);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextVal = e.target.value;
    setQuery(nextVal);
    setActiveIndex(-1);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (showSuggestions && nextVal.trim().length >= 2) {
      setIsLoading(true);
      debounceTimerRef.current = setTimeout(() => {
        void fetchSuggestions(nextVal);
      }, 250);
    } else {
      setSuggestions([]);
      setIsLoading(false);
      // Show recent searches if query is cleared but input is active
      if (showSuggestions && !nextVal.trim() && recentSearches.length > 0) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    }
  };

  const handleInputFocus = () => {
    if (query.trim().length >= 2 && suggestions.length > 0) {
      setIsOpen(true);
    } else if (!query.trim() && recentSearches.length > 0) {
      setIsOpen(true);
    }
  };

  const executeSearch = (targetQuery: string) => {
    const cleanQuery = targetQuery.trim();
    if (!cleanQuery) return;

    // Save to privacy-conscious local search history
    const updatedRecents = saveRecentSearch(cleanQuery);
    setRecentSearches(updatedRecents);

    setIsOpen(false);
    setActiveIndex(-1);

    if (onSearch) {
      onSearch(cleanQuery);
    } else {
      navigate(`/search?q=${encodeURIComponent(cleanQuery)}`);
    }
  };

  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    setIsOpen(false);
    setActiveIndex(-1);
    inputRef.current?.focus();
    if (onSearch) {
      onSearch('');
    }
  };

  const handleRemoveRecent = (e: React.MouseEvent, item: string) => {
    e.stopPropagation();
    const updated = removeRecentSearch(item);
    setRecentSearches(updated);
    if (updated.length === 0) {
      setIsOpen(false);
    }
  };

  const handleClearAllRecents = (e: React.MouseEvent) => {
    e.stopPropagation();
    clearRecentSearches();
    setRecentSearches([]);
    setIsOpen(false);
  };

  const isShowingRecents = !query.trim() && recentSearches.length > 0;
  const currentNavItemsCount = isShowingRecents ? recentSearches.length : suggestions.length;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || currentNavItemsCount === 0) {
      if (e.key === 'Enter') {
        e.preventDefault();
        executeSearch(query);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown': {
        e.preventDefault();
        const nextIdx = activeIndex < currentNavItemsCount - 1 ? activeIndex + 1 : 0;
        setActiveIndex(nextIdx);
        if (isShowingRecents) {
          const target = recentSearches[nextIdx];
          if (target) setActiveAnnouncement(`Recent search: ${target}`);
        } else {
          const target = suggestions[nextIdx];
          if (target) setActiveAnnouncement(`Suggestion: ${target.title}`);
        }
        break;
      }

      case 'ArrowUp': {
        e.preventDefault();
        const prevIdx = activeIndex > 0 ? activeIndex - 1 : currentNavItemsCount - 1;
        setActiveIndex(prevIdx);
        if (isShowingRecents) {
          const target = recentSearches[prevIdx];
          if (target) setActiveAnnouncement(`Recent search: ${target}`);
        } else {
          const target = suggestions[prevIdx];
          if (target) setActiveAnnouncement(`Suggestion: ${target.title}`);
        }
        break;
      }

      case 'Enter':
        e.preventDefault();
        if (activeIndex >= 0) {
          if (isShowingRecents && recentSearches[activeIndex]) {
            const selectedQuery = recentSearches[activeIndex]!;
            setQuery(selectedQuery);
            executeSearch(selectedQuery);
          } else if (suggestions[activeIndex]) {
            const selected = suggestions[activeIndex]!;
            setIsOpen(false);
            navigate(selected.destination);
          }
        } else {
          executeSearch(query);
        }
        break;

      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setActiveIndex(-1);
        break;

      default:
        break;
    }
  };

  const handleSelectSuggestion = (item: GlobalSearchResultItem) => {
    saveRecentSearch(item.title);
    setIsOpen(false);
    navigate(item.destination);
  };

  const getSuggestionIcon = (type: GlobalSearchResultItem['type']) => {
    switch (type) {
      case 'app':
        return (
          <Package size={15} className="global-search-sugg-icon global-search-sugg-icon--app" />
        );
      case 'blog_post':
        return (
          <BookOpen size={15} className="global-search-sugg-icon global-search-sugg-icon--blog" />
        );
      case 'help_article':
        return (
          <HelpCircle size={15} className="global-search-sugg-icon global-search-sugg-icon--help" />
        );
      default:
        return <Search size={15} className="global-search-sugg-icon" />;
    }
  };

  return (
    <div ref={containerRef} className={`global-search-container ${className}`}>
      {/* Screen Reader Announcement */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {activeAnnouncement}
      </div>

      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          executeSearch(query);
        }}
        className="global-search-form"
      >
        <div className="global-search-input-wrapper">
          <Search size={18} className="global-search-icon" aria-hidden="true" />

          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            autoFocus={autoFocus}
            autoComplete="off"
            spellCheck="false"
            aria-label="Search apps, engineering articles, and help guides"
            aria-autocomplete="list"
            aria-expanded={isOpen}
            aria-controls="global-search-suggestions"
            aria-activedescendant={
              activeIndex >= 0 ? `global-search-item-${activeIndex}` : undefined
            }
            className="global-search-input"
          />

          {isLoading && (
            <div className="global-search-loading" aria-label="Searching...">
              <Loader2 size={16} className="global-search-spinner" />
            </div>
          )}

          {query && !isLoading && (
            <button
              type="button"
              onClick={handleClear}
              className="global-search-clear-btn"
              aria-label="Clear search input"
            >
              <X size={15} aria-hidden="true" />
            </button>
          )}
        </div>
      </form>

      {/* Suggestions or Recent Searches Dropdown */}
      {isOpen && (
        <div
          id="global-search-suggestions"
          role="listbox"
          aria-label={isShowingRecents ? 'Recent searches' : 'Search suggestions'}
          className="global-search-dropdown"
        >
          {isShowingRecents ? (
            /* Recent Searches Mode */
            <>
              <div className="global-search-dropdown-header">
                <div className="global-search-header-group">
                  <History size={13} aria-hidden="true" />
                  <span>Recent Searches</span>
                </div>
                <button
                  type="button"
                  onClick={handleClearAllRecents}
                  className="global-search-clear-all"
                  aria-label="Clear all recent searches"
                >
                  Clear
                </button>
              </div>

              <ul className="global-search-suggestions-list">
                {recentSearches.map((term, idx) => {
                  const isSelected = activeIndex === idx;
                  return (
                    <li
                      key={term}
                      id={`global-search-item-${idx}`}
                      role="option"
                      aria-selected={isSelected}
                      className={`global-search-sugg-item ${isSelected ? 'global-search-sugg-item--active' : ''}`}
                      onClick={() => {
                        setQuery(term);
                        executeSearch(term);
                      }}
                    >
                      <div className="global-search-sugg-left">
                        <History
                          size={14}
                          className="global-search-history-icon"
                          aria-hidden="true"
                        />
                        <span className="global-search-sugg-title">{term}</span>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => handleRemoveRecent(e, term)}
                        className="global-search-remove-recent-btn"
                        aria-label={`Remove ${term} from recent searches`}
                      >
                        <Trash2 size={12} aria-hidden="true" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </>
          ) : suggestions.length > 0 ? (
            /* Live Search Suggestions Mode */
            <>
              <div className="global-search-dropdown-header">
                <span>Top Matches</span>
              </div>

              <ul className="global-search-suggestions-list">
                {suggestions.map((item, idx) => {
                  const isSelected = activeIndex === idx;
                  return (
                    <li
                      key={item.id}
                      id={`global-search-item-${idx}`}
                      role="option"
                      aria-selected={isSelected}
                      className={`global-search-sugg-item ${isSelected ? 'global-search-sugg-item--active' : ''}`}
                      onClick={() => handleSelectSuggestion(item)}
                    >
                      <div className="global-search-sugg-left">
                        {getSuggestionIcon(item.type)}
                        <div className="global-search-sugg-content">
                          <span className="global-search-sugg-title">{item.title}</span>
                          <span className="global-search-sugg-desc">{item.description}</span>
                        </div>
                      </div>

                      <div className="global-search-sugg-right">
                        <span className="global-search-sugg-badge">
                          {item.type === 'app'
                            ? 'App'
                            : item.type === 'blog_post'
                              ? 'Blog'
                              : 'Help'}
                        </span>
                        <ArrowRight
                          size={13}
                          className="global-search-sugg-arrow"
                          aria-hidden="true"
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>

              <div className="global-search-dropdown-footer">
                <button
                  type="button"
                  onClick={() => executeSearch(query)}
                  className="global-search-view-all-btn"
                >
                  <span>See all results for &ldquo;{query}&rdquo;</span>
                  <ArrowRight size={14} aria-hidden="true" />
                </button>
              </div>
            </>
          ) : null}
        </div>
      )}
    </div>
  );
};
