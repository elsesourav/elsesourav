"use client";

import Image from "next/image";
import Link from "next/link";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type AppGridCardData = {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  iconUrl: string;
  featureGraphicUrl: string | null;
  developerName: string;
  averageRating: number | string | null;
  isPaid: boolean;
  price: number | string;
  appCategory?: string;
  type?: string;
  layout?: "horizontal" | "vertical" | "square";
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatPrice(isPaid: boolean, value: number | string): string {
  if (!isPaid) return "Free";
  const n = typeof value === "string" ? Number(value) : value;
  if (!Number.isFinite(n) || n === 0) return "Free";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: n % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(n);
}

/* Single filled-star progress indicator */
function StarBadge({ rating }: { rating: number | string | null }) {
  const n =
    rating == null || rating == 0
      ? 5
      : typeof rating === "string"
        ? Number(rating)
        : rating;

  const value = Math.min(5, Math.max(0, n));
  const percent = (value / 5) * 100;

  const path =
    "M12 2.5l2.9 5.88 6.49.94-4.7 4.58 1.11 6.47L12 17.27l-5.8 3.1 1.1-6.47-4.69-4.58 6.48-.94z";

  return (
    <span className="flex items-center gap-1">
      {/* Star icon with partial fill */}
      <span className="relative inline-block size-4">
        <svg viewBox="0 0 24 24" className="absolute inset-0 h-full w-full">
          <path
            d={path}
            fill="transparent"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
            className="text-primary/90"
          />
        </svg>
        <span
          className="absolute inset-0 overflow-hidden"
          style={{ width: `${percent}%` }}
        >
          <svg viewBox="0 0 24 24" className="h-full min-w-3.5">
            <path
              d={path}
              fill="currentColor"
              className="text-primary/60"
              strokeWidth="0"
            />
          </svg>
        </span>
      </span>
      <span className="tabular-nums text-sm font-semibold text-primary/90">
        {value > 0 ? value.toFixed(1) : "-"}
      </span>
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  AppGridCard                                                        */
/*                                                                     */
/*  variant="grid"     — full width grid item (default)               */
/*  variant="carousel" — fixed-width scroll-snap card                 */
/* ------------------------------------------------------------------ */

export default function AppGridCard({
  app,
  variant = "grid",
}: {
  app: AppGridCardData;
  variant?: "grid" | "carousel";
}) {
  const price = formatPrice(app.isPaid, app.price);
  const heroImage = app.featureGraphicUrl ?? app.iconUrl;
  const label = app.appCategory ?? app.type ?? "";
  const isCarousel = variant === "carousel";

  return (
    <div
      className="app-grid-card group relative p-1 flex flex-col overflow-hidden rounded-(--app-card-radius) border ui-border transition-all duration-200 shadow-sm hover:shadow-md"
      style={
        isCarousel
          ? {
              minWidth: "clamp(280px, 48vw, 400px)",
              maxWidth: "400px",
              flex: "0 0 auto",
            }
          : undefined
      }
    >
      {/* Background pattern repeat image - applied outside the Link tag */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.8] -z-20"
        style={{
          backgroundImage: 'url("/img/pattern/light/white-waves.png")',
          backgroundRepeat: "repeat",
          backgroundSize: "200px",
        }}
      />

      <Link
        href={`/apps/${app.slug}`}
        data-app-card={isCarousel ? "" : undefined}
        aria-label={`View ${app.title}`}
        className="relative flex flex-col w-full h-full rounded-[inherit]"
      >
        {/* ── Hero zone ── */}
        <div
          className="relative w-full overflow-hidden rounded-tl-[calc(var(--app-card-radius)-3px)] rounded-tr-[calc(var(--app-card-radius)-3px)] rounded-bl-sm rounded-br-sm"
          style={{ aspectRatio: "16/9" }}
        >
          {/* Blurred ambient backdrop */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${heroImage})`,
              filter: "blur(22px) saturate(1.4) brightness(0.65)",
              transform: "scale(1)",
            }}
          />

          {/* Main image — fades into blurred base at bottom */}
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-[1.03]"
            style={{
              backgroundImage: `url(${heroImage})`,
              maskImage:
                "linear-gradient(to bottom, white 70%, rgba(255,255,255,0.3) 75%, transparent 100%)",
              WebkitMaskImage:
                "linear-gradient(to bottom, white 70%, rgba(255,255,255,0.3) 75%, transparent 100%)",
            }}
          />

          {/* Bottom scrim for text legibility */}
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-3/5 "
            style={{
              background:
                "linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.45) 45%, transparent 100%)",
            }}
          />

          {/* ── Top row: category (left) ← → price (right) ── */}
          <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 rounded-[inherit]">
            {/* Category — left, full text */}
            <span className="rounded-tl-[inherit] rounded-br-lg border border-white/10 bg-black/40 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/85 backdrop-blur-lg">
              {label || "App"}
            </span>

            {/* Price — right, full text */}
            <span className="rounded-tr-[inherit] rounded-bl-lg border border-white/10 bg-black/40 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white backdrop-blur-lg">
              {price}
            </span>
          </div>

          {/* ── Bottom: blurred description overlay ── */}
          <div className="absolute inset-x-0 bottom-0 px-4 pb-2">
            <p className="line-clamp-2 text-sm font-sans leading-relaxed font-semibold text-gray-300">
              {app.shortDescription}
            </p>
          </div>
        </div>

        {/* ── Footer: icon + title + developer + rating + view ── */}
        <div className="flex items-center gap-2.5 px-1 py-2.5">
          {/* App icon */}
          <div className="relative size-14 shrink-0 overflow-hidden rounded-xl border ui-border">
            <Image
              src={app.iconUrl}
              alt={`${app.title} icon`}
              fill
              className="object-cover"
              unoptimized
            />
          </div>

          {/* Title + developer + rating */}
          <div className="min-w-0 flex-1">
            <p className="truncate text-md font-bold leading-tight ui-text-heading">
              {app.title}
            </p>
            <p className="truncate text-xs leading-snug ui-text-muted">
              {app.developerName}
            </p>
            <StarBadge rating={app.averageRating} />
          </div>

          {/* View button */}
          <span className="shrink-0 rounded-xl border ui-border bg-[color-mix(in_srgb,var(--brand-secondary)_8%,var(--background)_92%)] px-4 py-1.5 text-sm font-bold text-[color-mix(in_srgb,var(--brand-secondary)_75%,var(--foreground)_25%)] transition-all duration-200 hover:border-[color-mix(in_srgb,var(--brand-secondary)_50%,transparent)] hover:bg-[color-mix(in_srgb,var(--brand-secondary)_16%,var(--background)_84%)] hover:text-[color-mix(in_srgb,var(--brand-secondary)_90%,var(--foreground)_10%)]">
            View
          </span>
        </div>
      </Link>
    </div>
  );
}
