import { useEffect, useState, type ReactNode } from "react";
import { cn } from "./utils";
import { Rating, type RatingProps } from "./Rating";
import { PlatformList } from "./PlatformBadge";
import type { AppCardVariant, AppItem } from "./types";

type Slot = "root" | "banner" | "icon" | "title" | "description" | "footer";

export interface AppCardProps {
  app: AppItem;
  /** "banner" = artwork on top (grid), "list" = compact horizontal row */
  variant?: AppCardVariant;

  showRating?: boolean;
  /** Defaults to "stars" for banner and "compact" for list */
  ratingStyle?: RatingProps["variant"];
  showPlatforms?: boolean;
  showDescription?: boolean;
  showCategory?: boolean;
  descriptionLines?: 1 | 2 | 3;
  /** Collapse platform pills into "+N" after this many */
  maxPlatforms?: number;

  /** Fade/slide in on mount. `index` staggers the entrance. */
  animate?: boolean;
  index?: number;

  /** Makes the whole card clickable (also fires when `app.href` is set) */
  onSelect?: (app: AppItem) => void;
  /** Makes the stars clickable */
  onRate?: (app: AppItem, value: number) => void;
  /** Slot at the bottom-right, e.g. a "Get" button */
  renderAction?: (app: AppItem) => ReactNode;

  /** Extra classes per part of the card */
  classNames?: Partial<Record<Slot, string>>;
  className?: string;
}

const clamp = { 1: "line-clamp-1", 2: "line-clamp-2", 3: "line-clamp-3" } as const;

function CardTrigger({ app, onSelect }: { app: AppItem; onSelect?: (app: AppItem) => void }) {
  const cls =
    "absolute inset-0 z-10 cursor-pointer rounded-[inherit] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500";
  if (app.href) {
    return <a href={app.href} onClick={() => onSelect?.(app)} aria-label={`Open ${app.name}`} className={cls} />;
  }
  if (onSelect) {
    return <button type="button" onClick={() => onSelect(app)} aria-label={`Open ${app.name}`} className={cls} />;
  }
  return null;
}

export function AppCard({
  app,
  variant = "banner",
  showRating = true,
  ratingStyle,
  showPlatforms = true,
  showDescription = true,
  showCategory = false,
  descriptionLines,
  maxPlatforms,
  animate = true,
  index = 0,
  onSelect,
  onRate,
  renderAction,
  classNames = {},
  className,
}: AppCardProps) {
  const [visible, setVisible] = useState(!animate);

  useEffect(() => {
    if (!animate) return;
    const id = window.setTimeout(() => setVisible(true), 16);
    return () => window.clearTimeout(id);
  }, [animate]);

  const Icon = app.icon;
  const isBanner = variant === "banner";
  const lines = descriptionLines ?? (isBanner ? 3 : 2);
  const ratingVariant = ratingStyle ?? (isBanner ? "stars" : "compact");

  const rating = showRating && (
    <div className={cn(isBanner ? "mt-1.5 w-fit" : "shrink-0", onRate && "relative z-20")}>
      <Rating
        value={app.rating}
        count={app.ratingCount}
        size={isBanner ? "sm" : "xs"}
        variant={ratingVariant}
        onChange={onRate ? (v) => onRate(app, v) : undefined}
      />
    </div>
  );

  const description = showDescription && (
    <p
      className={cn(
        "text-sm leading-relaxed text-slate-600 dark:text-slate-400",
        isBanner ? "mt-2" : "mt-0.5",
        clamp[lines],
        classNames.description
      )}
    >
      {app.description}
    </p>
  );

  const action = renderAction && <div className="relative z-20 shrink-0">{renderAction(app)}</div>;
  const hasFooter = (showPlatforms && app.platforms.length > 0) || Boolean(action);

  const footer = hasFooter && (
    <div className={cn("flex items-end justify-between gap-2", isBanner ? "mt-auto pt-3" : "mt-2", classNames.footer)}>
      {showPlatforms ? <PlatformList platforms={app.platforms} max={maxPlatforms} /> : <span />}
      {action}
    </div>
  );

  const shell = cn(
    "group relative h-full overflow-hidden rounded-2xl border border-slate-200/80 bg-white",
    "shadow-sm shadow-slate-900/5 transition-all duration-300 ease-out motion-reduce:transition-none",
    "hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-900/10 motion-reduce:hover:translate-y-0",
    "dark:border-white/10 dark:bg-slate-900 dark:shadow-none dark:hover:border-white/20 dark:hover:shadow-black/40"
  );

  return (
    <div
      style={{ transitionDelay: animate ? `${Math.min(index, 12) * 50}ms` : undefined }}
      className={cn(
        "h-full transition-[opacity,transform] duration-500 ease-out motion-reduce:transition-none",
        visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      )}
    >
      {isBanner ? (
        <article className={cn(shell, "flex flex-col", classNames.root, className)}>
          <CardTrigger app={app} onSelect={onSelect} />

          {/* Banner */}
          <div className={cn("relative h-28 shrink-0 overflow-hidden", classNames.banner)}>
            {app.bannerImage ? (
              <img
                src={app.bannerImage}
                alt=""
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110 motion-reduce:transition-none"
              />
            ) : (
              <>
                <div
                  className={cn(
                    "absolute inset-0 bg-gradient-to-br transition-transform duration-700 ease-out group-hover:scale-110 motion-reduce:transition-none",
                    app.bannerGradient
                  )}
                />
                <div className="absolute -right-8 -top-10 h-36 w-36 rounded-full bg-white/20 blur-2xl" />
                <div className="absolute -bottom-12 left-6 h-28 w-28 rounded-full bg-black/10 blur-2xl" />
                <Icon className="absolute right-5 top-1/2 h-20 w-20 -translate-y-1/2 text-white/25 transition-transform duration-500 ease-out group-hover:rotate-6 group-hover:scale-110 motion-reduce:transition-none" />
              </>
            )}
            {app.badge && (
              <span className="absolute left-3 top-3 rounded-full bg-white/25 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-md">
                {app.badge}
              </span>
            )}
          </div>

          {/* Body */}
          <div className="relative flex flex-1 flex-col px-4 pb-4">
            <div
              className={cn(
                "-mt-7 mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-lg shadow-slate-900/10 ring-4 ring-white",
                "transition-transform duration-300 ease-out group-hover:-translate-y-0.5 group-hover:scale-105 motion-reduce:transition-none",
                "dark:bg-slate-800 dark:ring-slate-900",
                classNames.icon
              )}
            >
              <Icon className={cn("h-7 w-7", app.iconColor ?? "text-blue-600 dark:text-blue-400")} />
            </div>

            <h3 className={cn("truncate text-base font-semibold tracking-tight text-slate-900 dark:text-white", classNames.title)}>
              {app.name}
            </h3>
            {showCategory && <span className="text-xs text-slate-500 dark:text-slate-400">{app.category}</span>}
            {rating}
            {description}
            {footer}
          </div>
        </article>
      ) : (
        <article className={cn(shell, "flex items-start gap-3 p-3", classNames.root, className)}>
          <CardTrigger app={app} onSelect={onSelect} />

          <div
            className={cn(
              "relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl",
              classNames.icon
            )}
          >
            {app.bannerImage ? (
              <img
                src={app.bannerImage}
                alt=""
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110 motion-reduce:transition-none"
              />
            ) : (
              <div
                className={cn(
                  "absolute inset-0 bg-gradient-to-br transition-transform duration-500 ease-out group-hover:scale-125 motion-reduce:transition-none",
                  app.bannerGradient
                )}
              />
            )}
            <span className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-white shadow-md transition-transform duration-300 group-hover:scale-110 motion-reduce:transition-none dark:bg-slate-800">
              <Icon className={cn("h-5 w-5", app.iconColor ?? "text-blue-600 dark:text-blue-400")} />
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <h3 className={cn("truncate text-[15px] font-semibold tracking-tight text-slate-900 dark:text-white", classNames.title)}>
                {app.name}
              </h3>
              {rating}
            </div>
            {showCategory && <span className="text-xs text-slate-500 dark:text-slate-400">{app.category}</span>}
            {description}
            {footer}
          </div>
        </article>
      )}
    </div>
  );
}
