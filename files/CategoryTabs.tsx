import { cn } from "./utils";

export interface CategoryTabsProps {
  categories: string[];
  active: string;
  onChange: (category: string) => void;
  className?: string;
}

export function CategoryTabs({ categories, active, onChange, className }: CategoryTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="App categories"
      className={cn(
        "-mx-4 flex gap-2 overflow-x-auto px-4 py-1 sm:mx-0 sm:px-0",
        "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className
      )}
    >
      {categories.map((category) => {
        const selected = category === active;
        return (
          <button
            key={category}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(category)}
            className={cn(
              "shrink-0 whitespace-nowrap rounded-full border px-4 py-1.5 text-sm font-medium transition-all duration-200 ease-out",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-sky-50 dark:focus-visible:ring-offset-[#0b1220]",
              "active:scale-95 motion-reduce:transition-none",
              selected
                ? "border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-600/30"
                : "border-slate-200 bg-white/70 text-slate-600 hover:border-blue-300 hover:bg-white hover:text-blue-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:border-white/25 dark:hover:bg-white/10 dark:hover:text-white"
            )}
          >
            {category}
          </button>
        );
      })}
    </div>
  );
}
