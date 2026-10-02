import type { Ref } from "react";
import { Search, X } from "lucide-react";
import { cn } from "./utils";

export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  inputRef?: Ref<HTMLInputElement>;
  tabIndex?: number;
  className?: string;
}

export function SearchBar({
  value,
  onChange,
  placeholder = "Search apps, extensions, tools...",
  inputRef,
  tabIndex,
  className,
}: SearchBarProps) {
  return (
    <label
      className={cn(
        "group/search flex items-center gap-2 rounded-full border border-transparent bg-sky-100/70 px-4 py-2.5 text-slate-500",
        "transition-all duration-200 focus-within:border-blue-400 focus-within:bg-white focus-within:shadow-lg focus-within:shadow-blue-500/10 focus-within:ring-4 focus-within:ring-blue-500/10",
        "dark:bg-white/5 dark:text-slate-400 dark:focus-within:border-blue-500/60 dark:focus-within:bg-white/[0.07] dark:focus-within:shadow-none",
        className
      )}
    >
      <Search className="h-4 w-4 shrink-0 transition-colors group-focus-within/search:text-blue-600 dark:group-focus-within/search:text-blue-400" />
      <input
        ref={inputRef}
        type="search"
        value={value}
        tabIndex={tabIndex}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label="Search apps"
        className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-500 [&::-webkit-search-cancel-button]:hidden dark:text-white dark:placeholder:text-slate-400"
      />
      <button
        type="button"
        tabIndex={value ? tabIndex : -1}
        aria-label="Clear search"
        onClick={() => onChange("")}
        className={cn(
          "rounded-full p-0.5 transition-all duration-200 hover:bg-slate-200 dark:hover:bg-white/10",
          value ? "scale-100 opacity-100" : "pointer-events-none scale-75 opacity-0"
        )}
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </label>
  );
}
