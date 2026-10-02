import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "./utils";

export type RatingSize = "xs" | "sm" | "md" | "lg";

export interface RatingProps {
  /** 0 – max (decimals render as partially filled stars) */
  value: number;
  max?: number;
  /** Number of reviews */
  count?: number;
  size?: RatingSize;
  /** "stars" = full row of stars, "compact" = ★ 4.8 (12k) */
  variant?: "stars" | "compact";
  showValue?: boolean;
  showCount?: boolean;
  /** Pass this to make the stars clickable */
  onChange?: (value: number) => void;
  className?: string;
}

const starSize: Record<RatingSize, string> = {
  xs: "h-3 w-3",
  sm: "h-3.5 w-3.5",
  md: "h-4 w-4",
  lg: "h-5 w-5",
};

const textSize: Record<RatingSize, string> = {
  xs: "text-[11px]",
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
};

export function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}k`;
  return String(n);
}

export function Rating({
  value,
  max = 5,
  count,
  size = "sm",
  variant = "stars",
  showValue = true,
  showCount = true,
  onChange,
  className,
}: RatingProps) {
  const [hover, setHover] = useState<number | null>(null);
  const interactive = typeof onChange === "function";
  const label = `Rated ${value.toFixed(1)} out of ${max}`;

  const countEl =
    showCount && count !== undefined ? (
      <span className="font-normal text-slate-400 dark:text-slate-500">({formatCount(count)})</span>
    ) : null;

  if (variant === "compact" && !interactive) {
    return (
      <span
        aria-label={label}
        className={cn("inline-flex items-center gap-1 tabular-nums", textSize[size], className)}
      >
        <Star className={cn(starSize[size], "shrink-0 fill-amber-400 text-amber-400")} />
        <span className="font-semibold text-slate-700 dark:text-slate-200">{value.toFixed(1)}</span>
        {countEl}
      </span>
    );
  }

  const shown = Math.min(Math.max(hover ?? value, 0), max);

  return (
    <div
      role={interactive ? "radiogroup" : "img"}
      aria-label={interactive ? "Rate this app" : label}
      className={cn("inline-flex items-center gap-1.5", className)}
    >
      <div className="flex items-center" onMouseLeave={() => setHover(null)}>
        {Array.from({ length: max }, (_, i) => {
          const fill = Math.min(Math.max(shown - i, 0), 1);
          const star = (
            <span className="relative inline-block">
              <Star className={cn(starSize[size], "shrink-0 fill-slate-200 text-slate-200 dark:fill-slate-700 dark:text-slate-700")} />
              <span
                className="absolute inset-y-0 left-0 overflow-hidden transition-[width] duration-200"
                style={{ width: `${fill * 100}%` }}
              >
                <Star className={cn(starSize[size], "max-w-none shrink-0 fill-amber-400 text-amber-400")} />
              </span>
            </span>
          );

          return interactive ? (
            <button
              key={i}
              type="button"
              role="radio"
              aria-checked={Math.round(value) === i + 1}
              aria-label={`${i + 1} star${i === 0 ? "" : "s"}`}
              onMouseEnter={() => setHover(i + 1)}
              onClick={() => onChange?.(i + 1)}
              className="rounded p-0.5 transition-transform duration-150 hover:scale-125 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
            >
              {star}
            </button>
          ) : (
            <span key={i}>{star}</span>
          );
        })}
      </div>
      {showValue && (
        <span className={cn("font-semibold tabular-nums text-slate-700 dark:text-slate-200", textSize[size])}>
          {shown.toFixed(1)}
        </span>
      )}
      {countEl && <span className={textSize[size]}>{countEl}</span>}
    </div>
  );
}
