import {
  DiscoveryRail,
  HeroShowcase,
  MixedHighlights,
  SupportCtaPanel,
  type HomeBanner,
  type HomeSlider,
  type SupportOverviewPayload,
} from "@/components/home";
import { PageHeader, PageShell } from "@/components/ui/page";
import { cn } from "@/lib/cn";
import { fetchServiceData } from "@/lib/service-client";
import type { PublicApp } from "@/lib/view-models";
import { Plus_Jakarta_Sans, Sora } from "next/font/google";

const headingFont = Sora({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const bodyFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const dynamic = "force-dynamic";

export default async function Home() {
  const [
    sliders,
    banners,
    featuredApps,
    latestApps,
    popularApps,
    supportOverview,
  ] = await Promise.all([
    fetchServiceData<HomeSlider[]>({
      service: "catalog",
      path: "/v1/catalog/sliders?type=HERO",
    }).catch(() => []),
    fetchServiceData<HomeBanner[]>({
      service: "catalog",
      path: "/v1/catalog/banners",
    }).catch(() => []),
    fetchServiceData<{ items: PublicApp[] }>({
      service: "catalog",
      path: "/v1/catalog/apps?featured=true&sort=latest&limit=8",
    })
      .then((payload) => payload.items)
      .catch(() => []),
    fetchServiceData<{ items: PublicApp[] }>({
      service: "catalog",
      path: "/v1/catalog/apps?sort=latest&limit=8",
    })
      .then((payload) => payload.items)
      .catch(() => []),
    fetchServiceData<{ items: PublicApp[] }>({
      service: "catalog",
      path: "/v1/catalog/apps?sort=popular&limit=8",
    })
      .then((payload) => payload.items)
      .catch(() => []),
    fetchServiceData<SupportOverviewPayload>({
      service: "content",
      path: "/v1/content/support/overview?categoryLimit=6&featuredHelpLimit=4&latestBlogLimit=4",
    }).catch(() => null),
  ]);

  const heroSlider = sliders[0] ?? null;
  const heroBanner =
    banners.find((banner) => banner.placement === "NEW") ?? banners[0] ?? null;

  return (
    <PageShell width="wide" className={cn(bodyFont.className, "gap-10 py-10")}>
      <HeroShowcase
        heroSlider={heroSlider}
        heroBanner={heroBanner}
        featuredApps={featuredApps}
        latestApps={latestApps}
        displayClassName={headingFont.className}
      />

      <PageHeader
        eyebrow="Homepage Experience"
        title="A modular light-first storefront"
        description="The homepage now blends app discovery, support docs, and blog highlights in reusable sections with accessible motion and contrast-safe controls."
      />

      <MixedHighlights
        supportOverview={supportOverview}
        featuredApps={featuredApps}
        displayClassName={headingFont.className}
      />

      <DiscoveryRail
        title="Featured releases"
        subtitle="Curated premium and free picks from the marketplace."
        apps={featuredApps}
        href="/apps?featured=true"
      />

      <DiscoveryRail
        title="Latest updates"
        subtitle="Fresh drops and recent improvements from active apps."
        apps={latestApps}
        href="/apps?sort=latest"
        compact
      />

      <DiscoveryRail
        title="Popular choices"
        subtitle="What users are opening and installing the most right now."
        apps={popularApps}
        href="/apps?sort=popular"
        compact
      />

      <SupportCtaPanel displayClassName={headingFont.className} />
    </PageShell>
  );
}
