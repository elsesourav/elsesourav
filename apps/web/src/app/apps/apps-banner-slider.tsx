"use client";

import { CardCarousel, type CarouselCard } from "@/components/CardCarousel";
import type { HomeBanner } from "@/components/home";
import { useMemo } from "react";

function toPlacementLabel(placement: HomeBanner["placement"]): string {
  switch (placement) {
    case "NEW":
      return "New";
    case "COMING_SOON":
      return "Coming Soon";
    case "SPECIAL_OFFER":
      return "Special Offer";
    case "EVENT":
      return "Event";
    default:
      return "Banner";
  }
}

function toPlacementBadgeClass(placement: HomeBanner["placement"]): string {
  switch (placement) {
    case "NEW":
      return "bg-rose-600 text-white border-1 border-rose-700";
    case "COMING_SOON":
      return "bg-yellow-600 text-white border-1 border-yellow-700";
    case "SPECIAL_OFFER":
      return "bg-red-600 text-white border-1 border-red-700";
    case "EVENT":
      return "bg-green-600 text-white border-1 border-green-700";
    default:
      return "bg-rose-600 text-white border-1 border-rose-700";
  }
}

function formatBannerDate(value: string | null): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function buildMeta(banner: HomeBanner): string | undefined {
  const starts = formatBannerDate(banner.appStartsAt);
  const ends = formatBannerDate(banner.appEndsAt);

  switch (banner.placement) {
    case "NEW":
    case "COMING_SOON":
      return starts ? `Launches ${starts}` : undefined;
    case "SPECIAL_OFFER":
    case "EVENT":
      if (starts) return `Starts ${starts}`;
      if (ends) return `Ends ${ends}`;
      return undefined;
    default:
      return undefined;
  }
}

function buildDetails(banner: HomeBanner): string[] | undefined {
  const details: string[] = [];
  const starts = formatBannerDate(banner.appStartsAt);
  const ends = formatBannerDate(banner.appEndsAt);

  if (banner.placement === "NEW" || banner.placement === "COMING_SOON") {
    if (starts) details.push(`Launch date: ${starts}`);
  } else {
    if (starts) details.push(`Start: ${starts}`);
    if (ends) details.push(`End: ${ends}`);
  }

  return details.length > 0 ? details : undefined;
}

export function AppsBannerSlider({ banners }: { banners: HomeBanner[] }) {
  const cards = useMemo<CarouselCard[]>(
    () =>
      banners
        .filter((banner) => banner.imageUrl.trim().length > 0)
        .slice(0, 6)
        .map((banner) => ({
          id: banner.id,
          category: toPlacementLabel(banner.placement),
          categoryClassName: toPlacementBadgeClass(banner.placement),
          title: banner.title,
          subtitle: banner.subtitle ?? undefined,
          meta: buildMeta(banner),
          details: buildDetails(banner),
          image: banner.imageUrl,
          href: banner.linkUrl?.trim() || "/apps",
        })),
    [banners],
  );

  if (cards.length === 0) {
    return null;
  }

  return (
    <section className="relative">
      <CardCarousel
        cards={cards}
        height={600}
        activeWidth={740}
        inactiveWidth={260}
        autoMoveMs={6200}
        actionLabel="Visit Now"
      />
    </section>
  );
}
