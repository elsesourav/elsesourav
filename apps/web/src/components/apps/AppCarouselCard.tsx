"use client";

import Image from "next/image";
import Link from "next/link";

export type AppCarouselCardData = {
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
  layout: "horizontal" | "vertical" | "square";
  appCategory?: string;
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatPrice(isPaid: boolean, value: number | string): string {
  if (!isPaid) return "Free";
  const n = typeof value === "string" ? Number(value) : value;
  if (!Number.isFinite(n) || n === 0) return "Free";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: n % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(n);
}

/* ------------------------------------------------------------------ */
/*  AppCarouselCard — compact horizontal-scroll card                   */
/* ------------------------------------------------------------------ */

export default function AppCarouselCard({ app }: { app: AppCarouselCardData }) {
  const price = formatPrice(app.isPaid, app.price);
  const heroImage = app.featureGraphicUrl ?? app.iconUrl;

  return (
    <Link
      href={`/apps/${app.slug}`}
      data-app-card
      aria-label={`View ${app.title}`}
      className="app-carousel-card group relative flex flex-col overflow-hidden rounded-[22px] border ui-border"
      style={{
        minWidth: "clamp(280px, 48vw, 380px)",
        maxWidth: "380px",
        flex: "0 0 auto",
      }}
    >
      {/* ── Hero image + text overlay ── */}
      <div
        className="relative w-full overflow-hidden"
        style={{ aspectRatio: "16/10" }}
      >
        <Image
          src={heroImage}
          alt={app.title}
          fill
          sizes="(max-width: 640px) 80vw, (max-width: 1024px) 42vw, 340px"
          className="object-cover"
          unoptimized
        />

        {/* Scrim */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, transparent 28%, rgba(0,0,0,0.18) 55%, rgba(0,0,0,0.72) 100%)",
          }}
        />

        {/* Price badge — top right */}
        <span className="absolute right-3 top-3 rounded-full bg-black/45 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-md">
          {price}
        </span>

        {/* Text overlay — bottom of image */}
        <div className="absolute inset-x-0 bottom-0 px-4 pb-4 pt-10">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/70">
            {app.isPaid && "Premium"}
          </p>
          <p className="mt-1 text-xs text-white/75 line-clamp-2 leading-snug">
            {app.shortDescription}
          </p>
        </div>
      </div>

      {/* ── Footer bar ── */}
      <div className="flex items-center gap-3 px-3.5 py-3 ui-card">
        {/* App icon */}
        <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl border ui-border shadow-sm">
          <Image
            src={app.iconUrl}
            alt={`${app.title} icon`}
            fill
            sizes="44px"
            className="object-cover"
            unoptimized
          />
        </div>

        {/* Name + developer */}
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-semibold ui-text-heading leading-tight">
            {app.title}
          </p>
          <p className="truncate text-[11px] ui-text-muted leading-snug">
            {app.developerName}
          </p>
        </div>

        {/* View button */}
        <span className="shrink-0 rounded-full bg-[color-mix(in_srgb,var(--brand-secondary)_10%,var(--background)_90%)] px-4 py-1.5 text-[11px] font-bold text-[color-mix(in_srgb,var(--brand-secondary)_80%,var(--foreground)_20%)] transition-colors duration-150 group-hover:bg-[color-mix(in_srgb,var(--brand-secondary)_22%,var(--background)_78%)] group-hover:text-[color-mix(in_srgb,var(--brand-secondary)_90%,var(--foreground)_10%)]">
          View
        </span>
      </div>
    </Link>
  );
}

/* ── Backward-compat re-exports ── */
export type { AppCarouselCardData as CategoryAppCardData };
