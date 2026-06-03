"use client";

import { useEffect, useState, useRef } from "react";
import { Search, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

export function HelpSearch() {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce query
  const [debouncedQuery, setDebouncedQuery] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Fetch search results
  const { data: results, isLoading } = useQuery({
    queryKey: ["help-search", debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery || debouncedQuery.length < 2) return [];
      const res = await fetch(`/api/content/help/articles?search=${encodeURIComponent(debouncedQuery)}&limit=5`);
      if (!res.ok) return [];
      const json = await res.json();
      return (json.data?.items || []) as any[];
    },
    enabled: debouncedQuery.length >= 2,
  });

  // Handle Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(true);
        setTimeout(() => inputRef.current?.focus(), 50);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div 
        className="relative group cursor-text"
        onClick={() => {
          setIsOpen(true);
          setTimeout(() => inputRef.current?.focus(), 50);
        }}
      >
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted group-hover:text-brand-primary transition-colors" />
        <input 
          ref={inputRef}
          type="text" 
          placeholder="Search docs... (Cmd+K)" 
          className="w-full pl-9 pr-12 py-2 text-sm bg-surface-elevated border border-border-subtle rounded-lg focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all shadow-sm"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
        />
        <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 hidden h-5 select-none items-center gap-1 rounded border border-border-subtle bg-bg-base px-1.5 font-mono text-[10px] font-medium text-text-muted opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </div>

      {isOpen && (query.length > 0 || results) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-bg-base border border-border-subtle rounded-xl shadow-xl z-50 max-h-[300px] overflow-y-auto">
          {isLoading && query.length >= 2 ? (
            <div className="flex items-center justify-center p-4 text-sm text-text-muted">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Searching...
            </div>
          ) : results && results.length > 0 ? (
            <div className="py-2">
              {results.map((article) => (
                <Link
                  key={article.id}
                  href={`/help/${article.slug}`}
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-2 hover:bg-surface-active transition-colors group"
                >
                  <p className="text-sm font-medium text-text-primary group-hover:text-brand-primary">
                    {article.title}
                  </p>
                  {article.category && (
                    <p className="text-[10px] uppercase font-bold text-text-muted mt-0.5 tracking-wider">
                      {article.category.name}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          ) : query.length >= 2 ? (
            <div className="p-4 text-sm text-center text-text-muted">
              No results found for "{query}"
            </div>
          ) : (
            <div className="p-4 text-xs text-center text-text-muted">
              Type at least 2 characters to search
            </div>
          )}
        </div>
      )}
    </div>
  );
}
