import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Loader2, Package, BookOpen, HelpCircle, ArrowRight } from 'lucide-react';
import { globalSearchService } from '@/services/global-search.service';
import type { GlobalSearchResultItem } from '@/types/search.types';
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
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Synchronize initial value when prop changes
  useEffect(() => {
    setQuery(initialValue);
  }, [initialValue]);

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

  // Fetch suggestions with debouncing
  const fetchSuggestions = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const res = await globalSearchService.getSuggestions(searchQuery.trim(), 6);
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
      }, 300);
    } else {
      setSuggestions([]);
      setIsOpen(false);
      setIsLoading(false);
    }
  };

  const executeSearch = (targetQuery: string) => {
    const cleanQuery = targetQuery.trim();
    if (!cleanQuery) return;

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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0) {
      if (e.key === 'Enter') {
        e.preventDefault();
        executeSearch(query);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
        break;

      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
        break;

      case 'Enter':
        e.preventDefault();
        if (activeIndex >= 0 && suggestions[activeIndex]) {
          const selected = suggestions[activeIndex];
          setIsOpen(false);
          navigate(selected.destination);
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

      {/* Suggestions Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div
          id="global-search-suggestions"
          role="listbox"
          aria-label="Search suggestions"
          className="global-search-dropdown"
        >
          <div className="global-search-dropdown-header">
            <span>Quick Suggestions</span>
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
                      {item.type === 'app' ? 'App' : item.type === 'blog_post' ? 'Blog' : 'Help'}
                    </span>
                    <ArrowRight size={13} className="global-search-sugg-arrow" aria-hidden="true" />
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
        </div>
      )}
    </div>
  );
};
