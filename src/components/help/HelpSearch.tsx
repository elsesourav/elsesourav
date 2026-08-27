import React, { useState, useEffect, useRef, useId } from 'react';
import { Link } from 'react-router-dom';
import { Search, X, Loader2, FileText, ArrowRight } from 'lucide-react';
import { helpService } from '@/services/help.service';
import type { HelpArticle, HelpCategory } from '@/types/help.types';
import './HelpSearch.css';

interface HelpSearchProps {
  readonly placeholder?: string;
  readonly categories?: readonly HelpCategory[];
  readonly onSearchSubmitted?: (query: string) => void;
  readonly autoFocus?: boolean;
}

export const HelpSearch: React.FC<HelpSearchProps> = ({
  placeholder = 'Search for answers, guides, troubleshooting...',
  categories = [],
  onSearchSubmitted,
  autoFocus = false,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<readonly HelpArticle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();

  // Create a map of categoryId -> categorySlug / Name for quick lookup
  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  // Debounced search
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setIsLoading(false);
      setHasSearched(false);
      return;
    }

    setIsLoading(true);
    setHasSearched(true);

    const timer = setTimeout(async () => {
      const res = await helpService.searchArticles(trimmed, { limit: 6 });
      if (res.success) {
        setResults(res.data.items);
      } else {
        setResults([]);
      }
      setIsLoading(false);
      setIsOpen(true);
    }, 280);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    setHasSearched(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'Enter' && onSearchSubmitted) {
      onSearchSubmitted(query);
    }
  };

  return (
    <div className="help-search-container" ref={containerRef}>
      <div className="help-search-input-wrapper">
        <Search size={20} className="help-search-icon" aria-hidden="true" />
        <label htmlFor={inputId} className="visually-hidden">
          Search Help Articles
        </label>
        <input
          id={inputId}
          ref={inputRef}
          type="search"
          role="searchbox"
          className="help-search-input"
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (e.target.value.trim().length >= 2) {
              setIsOpen(true);
            }
          }}
          onFocus={() => {
            if (query.trim().length >= 2) {
              setIsOpen(true);
            }
          }}
          onKeyDown={handleKeyDown}
          autoFocus={autoFocus}
          autoComplete="off"
          aria-expanded={isOpen}
          aria-controls="help-search-results-list"
        />

        {isLoading && (
          <Loader2 size={18} className="help-search-spinner" aria-label="Searching..." />
        )}

        {query && !isLoading && (
          <button
            type="button"
            className="help-search-clear-btn"
            onClick={handleClear}
            aria-label="Clear search query"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {isOpen && query.trim().length >= 2 && (
        <div
          id="help-search-results-list"
          className="help-search-dropdown"
          role="region"
          aria-label="Search Results"
        >
          {isLoading && (
            <div className="help-search-status" aria-live="polite">
              Searching help articles...
            </div>
          )}

          {!isLoading && results.length === 0 && hasSearched && (
            <div className="help-search-empty" aria-live="polite">
              <p className="help-search-empty__title">No articles found</p>
              <p className="help-search-empty__desc">
                No matching articles for &ldquo;{query}&rdquo;. Try another term or contact support.
              </p>
            </div>
          )}

          {!isLoading && results.length > 0 && (
            <div className="help-search-results-list">
              <span className="help-search-results-header">Matching Articles</span>
              {results.map((article) => {
                const cat = categoryMap.get(article.categoryId);
                const catSlug = cat ? cat.slug : 'general';

                return (
                  <Link
                    key={article.id}
                    to={`/help/${catSlug}/${article.slug}`}
                    className="help-search-item"
                    onClick={() => setIsOpen(false)}
                  >
                    <div className="help-search-item__icon" aria-hidden="true">
                      <FileText size={16} />
                    </div>
                    <div className="help-search-item__info">
                      <span className="help-search-item__title">{article.title}</span>
                      {cat && <span className="help-search-item__category">{cat.name}</span>}
                    </div>
                    <ArrowRight size={14} className="help-search-item__arrow" aria-hidden="true" />
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
