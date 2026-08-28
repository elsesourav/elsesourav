'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input, Button } from '@elsesourav/ui';
import { Search, X } from 'lucide-react';

interface HelpSearchBarProps {
  categorySlug?: string;
  placeholder?: string;
}

export function HelpSearchBar({
  categorySlug,
  placeholder = 'Search articles, guides, troubleshooting steps...',
}: HelpSearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentQuery = searchParams.get('q') || '';
  const [query, setQuery] = React.useState(currentQuery);

  React.useEffect(() => {
    setQuery(currentQuery);
  }, [currentQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = query.trim();
    if (clean) {
      const base = categorySlug ? `/help/${categorySlug}` : '/help';
      router.push(`${base}?q=${encodeURIComponent(clean)}`);
    } else {
      const base = categorySlug ? `/help/${categorySlug}` : '/help';
      router.push(base);
    }
  };

  const handleClear = () => {
    setQuery('');
    const base = categorySlug ? `/help/${categorySlug}` : '/help';
    router.push(base);
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-2xl mx-auto">
      <div className="relative flex items-center">
        <Search className="w-5 h-5 text-zinc-500 absolute left-4 pointer-events-none" />
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-12 pr-24 py-3.5 bg-zinc-900/80 border-zinc-800 focus:border-indigo-500 text-sm text-zinc-100 rounded-2xl shadow-xl backdrop-blur-md placeholder:text-zinc-500"
          aria-label="Search help articles"
        />
        <div className="absolute right-2 flex items-center gap-1.5">
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1.5 text-zinc-500 hover:text-zinc-300 transition-colors"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <Button
            type="submit"
            size="sm"
            className="h-8 px-3 text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl"
          >
            Search
          </Button>
        </div>
      </div>
    </form>
  );
}
