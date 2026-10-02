import { useEffect, useMemo, useRef, useState } from "react";
import { Search, SearchX, X } from "lucide-react";
import { AppCard, type AppCardProps } from "./AppCard";
import { CategoryTabs } from "./CategoryTabs";
import { SearchBar } from "./SearchBar";
import { useMediaQuery } from "./useMediaQuery";
import { cn } from "./utils";
import type { AppCardVariant, AppItem } from "./types";

export interface ExploreAppsProps {
  apps: AppItem[];
  title?: string;
  subtitle?: string;
  /** Defaults to "All" + every category found in `apps` */
  categories?: string[];
  /** "auto" = banner cards on tablet/desktop, list cards on phones */
  variant?: AppCardVariant | "auto";
  /** Forwarded to every AppCard */
  cardProps?: Omit<AppCardProps, "app" | "variant" | "index">;
  onSelectApp?: (app: AppItem) => void;
  /** Override the grid classes */
  gridClassName?: string;
  className?: string;
}

function LogoMark() {
  return (
    <div className="grid h-9 w-9 shrink-0 grid-cols-2 gap-[3px]" aria-hidden="true">
      <span className="rounded-[5px] bg-blue-500" />
      <span className="rounded-[5px] bg-sky-400" />
      <span className="rounded-[5px] bg-blue-600" />
      <span className="rounded-[5px] bg-blue-400" />
    </div>
  );
}

export function ExploreApps({
  apps,
  title = "Explore Apps",
  subtitle = "Tools for a better and more productive you",
  categories,
  variant = "auto",
  cardProps,
  onSelectApp,
  gridClassName,
  className,
}: ExploreAppsProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [searchOpen, setSearchOpen] = useState(false);
  const mobileInput = useRef<HTMLInputElement>(null);
  const isWide = useMediaQuery("(min-width: 640px)");

  const tabs = useMemo(
    () => categories ?? ["All", ...Array.from(new Set(apps.map((a) => a.category)))],
    [apps, categories]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return apps.filter((app) => {
      const inCategory = category === "All" || app.category === category;
      const inQuery =
        !q ||
        app.name.toLowerCase().includes(q) ||
        app.description.toLowerCase().includes(q) ||
        app.category.toLowerCase().includes(q);
      return inCategory && inQuery;
    });
  }, [apps, category, query]);

  useEffect(() => {
    if (searchOpen) {
      const id = window.setTimeout(() => mobileInput.current?.focus(), 250);
      return () => window.clearTimeout(id);
    }
  }, [searchOpen]);

  const cardVariant: AppCardVariant = variant === "auto" ? (isWide ? "banner" : "list") : variant;

  const grid =
    gridClassName ??
    (cardVariant === "banner"
      ? "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      : "grid grid-cols-1 gap-3 md:grid-cols-2");

  return (
    <section
      className={cn(
        "rounded-3xl bg-sky-50/70 p-4 text-slate-900 sm:p-6 dark:bg-[#0b1220] dark:text-white",
        className
      )}
    >
      {/* Header */}
      <header className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <LogoMark />
          <div className="min-w-0">
            <h2 className="truncate text-xl font-bold tracking-tight">{title}</h2>
            <p className="truncate text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
          </div>
        </div>

        <SearchBar value={query} onChange={setQuery} className="hidden w-[22rem] lg:flex" />

        <button
          type="button"
          aria-label={searchOpen ? "Close search" : "Open search"}
          aria-expanded={searchOpen}
          onClick={() => setSearchOpen((o) => !o)}
          className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-sky-100 active:scale-95 lg:hidden dark:text-slate-300 dark:hover:bg-white/10"
        >
          <Search className={cn("absolute h-5 w-5 transition-all duration-200", searchOpen ? "rotate-90 scale-0 opacity-0" : "scale-100 opacity-100")} />
          <X className={cn("absolute h-5 w-5 transition-all duration-200", searchOpen ? "scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0")} />
        </button>
      </header>

      {/* Collapsible search (tablet + phone) */}
      <div
        className={cn(
          "grid transition-[grid-template-rows,opacity,margin] duration-300 ease-out lg:hidden",
          searchOpen ? "mt-4 grid-rows-[1fr] opacity-100" : "mt-0 grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="overflow-hidden p-1 -m-1">
          <SearchBar value={query} onChange={setQuery} inputRef={mobileInput} tabIndex={searchOpen ? 0 : -1} />
        </div>
      </div>

      {/* Categories */}
      <CategoryTabs categories={tabs} active={category} onChange={setCategory} className="mt-5" />

      {/* Results */}
      <p className="sr-only" aria-live="polite">
        {filtered.length} {filtered.length === 1 ? "app" : "apps"} found
      </p>

      {filtered.length > 0 ? (
        // `key` remounts the grid when the category changes so the entrance animation replays
        <div key={`${category}-${cardVariant}`} className={cn("mt-5", grid)}>
          {filtered.map((app, i) => (
            <AppCard
              key={app.id}
              app={app}
              index={i}
              variant={cardVariant}
              onSelect={onSelectApp}
              {...cardProps}
            />
          ))}
        </div>
      ) : (
        <div className="mt-10 flex flex-col items-center gap-2 py-10 text-center">
          <SearchX className="h-10 w-10 text-slate-300 dark:text-slate-600" />
          <p className="font-semibold">No apps found</p>
          <p className="max-w-xs text-sm text-slate-500 dark:text-slate-400">
            Try a different keyword or pick another category.
          </p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setCategory("All");
            }}
            className="mt-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 active:scale-95"
          >
            Clear filters
          </button>
        </div>
      )}
    </section>
  );
}
