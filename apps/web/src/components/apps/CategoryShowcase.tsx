"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import CategoryAppCard, {
  type CategoryAppCardData,
} from "./CategoryAppCard";

/* ------------------------------------------------------------------ */
/*  Public types                                                       */
/* ------------------------------------------------------------------ */

export type CategoryShowcaseApp = CategoryAppCardData;

export type CategoryShowcaseData = {
  id?: string;
  type?: string;
  name: string;
  description: string | null;
  apps: CategoryShowcaseApp[];
};

/* ------------------------------------------------------------------ */
/*  Scroll hook                                                        */
/* ------------------------------------------------------------------ */

function useHorizontalScroll() {
  const ref = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const check = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    check();
    el.addEventListener("scroll", check, { passive: true });
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", check);
      ro.disconnect();
    };
  }, [check]);

  const scroll = useCallback((direction: "left" | "right") => {
    const el = ref.current;
    if (!el) return;
    const card = el.querySelector("[data-app-card]");
    const cardWidth = card?.clientWidth ?? 320;
    el.scrollBy({
      left: direction === "left" ? -(cardWidth + 16) * 2 : (cardWidth + 16) * 2,
      behavior: "smooth",
    });
  }, []);

  return { ref, canScrollLeft, canScrollRight, scroll };
}

/* ------------------------------------------------------------------ */
/*  Scroll arrow button                                                */
/* ------------------------------------------------------------------ */

function ScrollArrow({
  direction,
  onClick,
  visible,
}: {
  direction: "left" | "right";
  onClick: () => void;
  visible: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Scroll ${direction}`}
      className="absolute top-1/2 z-20 -translate-y-1/2 rounded-full border ui-border bg-[color-mix(in_srgb,var(--background)_92%,white_8%)] p-2 shadow-md transition-opacity duration-200"
      style={{
        [direction]: "-14px",
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      <svg
        className="h-4 w-4 ui-text-heading"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2.5}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d={
            direction === "left"
              ? "M15.75 19.5L8.25 12l7.5-7.5"
              : "M8.25 4.5l7.5 7.5-7.5 7.5"
          }
        />
      </svg>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export default function CategoryShowcase({
  category,
  showMoreHref,
}: {
  category: CategoryShowcaseData;
  showMoreHref?: string;
}) {
  const { ref, canScrollLeft, canScrollRight, scroll } = useHorizontalScroll();

  if (category.apps.length === 0) return null;

  return (
    <section className="space-y-4">
      {/* Header — name + description only, same as before */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold ui-text-heading">
            {category.name}
          </h2>
          <p className="mt-1 max-w-2xl text-sm ui-text-muted line-clamp-2">
            {category.description ? category.description : " "}
          </p>
        </div>

        <Link
          href={
            showMoreHref ??
            (category.type
              ? `/apps?type=${category.type}`
              : `/apps?categoryId=${category.id}`)
          }
          className="flex items-center gap-1 rounded-full border ui-border bg-[color-mix(in_srgb,var(--background)_92%,white_8%)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] ui-text-primary transition-colors duration-200 hover:border-[color-mix(in_srgb,var(--brand-secondary)_55%,transparent)] hover:text-[color-mix(in_srgb,var(--brand-secondary)_70%,var(--foreground)_30%)]"
        >
          Show more
          <svg
            className="h-3 w-3"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.25 4.5l7.5 7.5-7.5 7.5"
            />
          </svg>
        </Link>
      </div>

      {/* Horizontal scroll row */}
      <div className="relative">
        <ScrollArrow
          direction="left"
          onClick={() => scroll("left")}
          visible={canScrollLeft}
        />

        <div
          ref={ref}
          className="flex gap-4 overflow-x-auto pb-1 scrollbar-hide"
          style={{ scrollSnapType: "x mandatory" }}
        >
          {category.apps.map((app) => (
            <div key={app.id} style={{ scrollSnapAlign: "start" }}>
              <CategoryAppCard app={app} />
            </div>
          ))}
        </div>

        <ScrollArrow
          direction="right"
          onClick={() => scroll("right")}
          visible={canScrollRight}
        />

        {/* Left/right fade edges */}
        {canScrollLeft && (
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-[var(--background)] to-transparent" />
        )}
        {canScrollRight && (
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-[var(--background)] to-transparent" />
        )}
      </div>
    </section>
  );
}
