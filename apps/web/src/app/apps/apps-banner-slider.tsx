"use client";

import { CardCarousel, type CarouselCard } from "@/components/CardCarousel";
import type { HomeBanner } from "@/components/home";
import { useMemo } from "react";

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
  const starts = formatBannerDate(banner.startsAt);
  const ends = formatBannerDate(banner.endsAt);

  switch (banner.placement) {
    case "NEW":
    case "COMING_SOON":
      return starts ? `Launches ${starts}` : undefined;
    case "SPECIAL_OFFER":
    case "EVENT":
      if (starts && ends) return `${starts} - ${ends}`;
      if (starts) return `Starts ${starts}`;
      return undefined;
    default:
      return undefined;
  }
}

export function AppsBannerSlider({ banners }: { banners: HomeBanner[] }) {
  const cards = useMemo<CarouselCard[]>(
    () =>
      banners
        .filter((banner) => banner.imageUrl.trim().length > 0)
        .slice(0, 6)
        .map((banner) => ({
          id: banner.id,
          category: banner.placement,
          categoryClassName: toPlacementBadgeClass(banner.placement),
          title: banner.title,
          subtitle: banner.subtitle ?? undefined,
          meta: buildMeta(banner),
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
