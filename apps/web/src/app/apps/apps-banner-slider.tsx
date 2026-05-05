"use client";

import type { HomeBanner } from "@/components/home";
import { Carousel } from "@/components/application/carousel/carousel-base";
import { cn } from "@/lib/cn";
import type { UseEmblaCarouselType } from "embla-carousel-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const AUTO_ADVANCE_MS = 6200;

type CarouselApi = UseEmblaCarouselType[1];

function getBannerHref(banner: HomeBanner): string {
  return banner.linkUrl?.trim() || "/apps";
}

function isExternalUrl(href: string): boolean {
  return /^https?:\/\//i.test(href);
}

function toPlacementLabel(placement: HomeBanner["placement"]): string {
  switch (placement) {
    case "HOME_HERO":
      return "Home Hero";
    case "LATEST":
      return "Latest";
    case "UPCOMING":
      return "Upcoming";
    default:
      return "Banner";
  }
}

export function AppsBannerSlider({ banners }: { banners: HomeBanner[] }) {
  const slides = useMemo(
    () =>
      banners
        .filter((banner) => banner.imageUrl.trim().length > 0)
        .slice(0, 6),
    [banners],
  );

  const [carouselApi, setCarouselApi] = useState<CarouselApi | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
  }, [slides.length]);

  useEffect(() => {
    if (!carouselApi) {
      return;
    }

    const onSelect = () => {
      setActiveIndex(carouselApi.selectedScrollSnap());
    };

    onSelect();
    carouselApi.on("select", onSelect);
    carouselApi.on("reInit", onSelect);

    return () => {
      carouselApi.off("select", onSelect);
      carouselApi.off("reInit", onSelect);
    };
  }, [carouselApi]);

  useEffect(() => {
    if (!carouselApi || slides.length < 2) {
      return;
    }

    const timer = window.setInterval(() => {
      carouselApi.scrollNext();
    }, AUTO_ADVANCE_MS);

    return () => {
      window.clearInterval(timer);
    };
  }, [carouselApi, slides.length]);

  if (slides.length === 0) {
    return null;
  }

  return (
    <section className="relative overflow-hidden rounded-4xl border border-black/10 bg-[#0f172a] text-white shadow-[0_26px_65px_-36px_rgba(10,15,30,0.9)]">
      <Carousel.Root
        className="relative h-72 sm:h-88 lg:h-100"
        opts={{
          loop: slides.length > 1,
          align: "start",
        }}
        setApi={setCarouselApi}
      >
        <Carousel.Content className="h-full">
          {slides.map((slide, index) => {
            const isActive = index === activeIndex;
            const href = getBannerHref(slide);
            const external = isExternalUrl(href);

            return (
              <Carousel.Item key={slide.id} className="relative h-full overflow-hidden">
                <Image
                  src={slide.imageUrl}
                  alt={slide.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 90vw"
                  className="object-cover"
                  unoptimized
                  priority={index === 0}
                />

                <div className="absolute inset-0 bg-[linear-gradient(104deg,rgba(2,6,23,0.95)_0%,rgba(2,6,23,0.78)_42%,rgba(2,6,23,0.58)_70%,rgba(2,6,23,0.44)_100%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.14),transparent_46%)]" />

                <div className="relative z-10 flex h-full items-end p-6 sm:p-8 lg:p-10">
                  <div className="max-w-3xl rounded-2xl border border-white/22 bg-black/34 p-4 backdrop-blur-md sm:p-5">
                    <p
                      className={cn(
                        "text-xs font-semibold uppercase tracking-[0.16em] text-white/85 drop-shadow-[0_2px_6px_rgba(0,0,0,0.65)] transition-all duration-500",
                        isActive
                          ? "translate-y-0 opacity-100"
                          : "translate-y-3 opacity-0",
                      )}
                    >
                      {toPlacementLabel(slide.placement)} banner
                    </p>

                    <h2
                      className={cn(
                        "mt-2 text-2xl font-semibold leading-tight tracking-tight text-white drop-shadow-[0_3px_10px_rgba(0,0,0,0.7)] transition-all duration-500 sm:text-4xl",
                        isActive
                          ? "translate-y-0 opacity-100"
                          : "translate-y-3 opacity-0",
                      )}
                    >
                      {slide.title}
                    </h2>

                    <p
                      className={cn(
                        "mt-2 max-w-xl text-sm text-white/92 drop-shadow-[0_2px_8px_rgba(0,0,0,0.65)] transition-all duration-500 sm:text-base",
                        isActive
                          ? "translate-y-0 opacity-100"
                          : "translate-y-3 opacity-0",
                      )}
                    >
                      Auto-rotates every 6.2 seconds with swipe and arrow controls.
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {external ? (
                        <a
                          href={href}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex rounded-full border border-white/40 bg-white/18 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/28"
                        >
                          Open campaign
                        </a>
                      ) : (
                        <Link
                          href={href}
                          className="inline-flex rounded-full border border-white/40 bg-white/18 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/28"
                        >
                          Open campaign
                        </Link>
                      )}

                      <Link
                        href="/apps"
                        className="inline-flex rounded-full border border-white/30 bg-black/20 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-black/35"
                      >
                        Explore catalog
                      </Link>
                    </div>
                  </div>
                </div>
              </Carousel.Item>
            );
          })}
        </Carousel.Content>

        {slides.length > 1 ? (
          <>
            <div className="absolute right-4 top-4 z-20 flex items-center gap-2 sm:right-6 sm:top-6">
              <Carousel.PrevTrigger
                asChild
                className={({ isDisabled }) =>
                  cn(
                    "inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/35 bg-black/30 text-sm font-semibold text-white transition-colors",
                    isDisabled ? "opacity-40" : "hover:bg-black/45",
                  )
                }
              >
                <button type="button">{"<"}</button>
              </Carousel.PrevTrigger>

              <Carousel.NextTrigger
                asChild
                className={({ isDisabled }) =>
                  cn(
                    "inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/35 bg-black/30 text-sm font-semibold text-white transition-colors",
                    isDisabled ? "opacity-40" : "hover:bg-black/45",
                  )
                }
              >
                <button type="button">{">"}</button>
              </Carousel.NextTrigger>
            </div>

            <div
              className="absolute inset-x-4 bottom-4 z-20 grid gap-2 sm:inset-x-6 sm:bottom-6"
              style={{
                gridTemplateColumns: `repeat(${slides.length}, minmax(0, 1fr))`,
              }}
            >
              {slides.map((slide, index) => {
                const isActive = index === activeIndex;

                return (
                  <button
                    key={slide.id}
                    type="button"
                    onClick={() => carouselApi?.scrollTo(index)}
                    className="relative h-1.5 overflow-hidden rounded-full bg-white/28 transition-colors hover:bg-white/38"
                    aria-label={`Show banner ${index + 1}`}
                    aria-current={isActive}
                  >
                    <span
                      className={cn(
                        "absolute inset-0 bg-white shadow-[0_0_12px_rgba(255,255,255,0.55)] transition-transform duration-500",
                        isActive ? "scale-x-100" : "scale-x-0",
                      )}
                    />
                  </button>
                );
              })}
            </div>
          </>
        ) : null}
      </Carousel.Root>
    </section>
  );
}
