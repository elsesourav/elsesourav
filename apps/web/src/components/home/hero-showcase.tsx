"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/cn";
import { formatPrice, type PublicApp } from "@/lib/view-models";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Image from "next/image";
import Link from "next/link";
import {
  formatCompactCount,
  formatRating,
  pickFirstAvailableUrl,
} from "./home-utils";
import styles from "./homepage.module.css";
import type { HomeBanner, HomeSlider } from "./types";

export function HeroShowcase({
  heroSlider,
  heroBanner,
  featuredApps,
  latestApps,
  displayClassName,
}: {
  heroSlider: HomeSlider | null;
  heroBanner: HomeBanner | null;
  featuredApps: PublicApp[];
  latestApps: PublicApp[];
  displayClassName: string;
}) {
  const spotlightApp =
    heroSlider?.app ?? featuredApps[0] ?? latestApps[0] ?? null;
  const fallbackHeroImage =
    spotlightApp?.media?.[0]?.url ??
    spotlightApp?.iconUrl ??
    heroBanner?.imageUrl ??
    "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=80";

  const heroImage = pickFirstAvailableUrl(
    heroSlider?.imageUrl,
    fallbackHeroImage,
  );
  const heroTitle = heroSlider?.title ?? "Curated tools for modern builders";
  const heroDescription =
    heroSlider?.description ??
    "Discover high-quality apps, practical guides, and hands-on support workflows in one polished dashboard.";

  const totalDownloads = featuredApps.reduce(
    (sum, app) => sum + (app.aggregateStat?.downloadCount ?? 0),
    0,
  );
  const totalViews = latestApps.reduce(
    (sum, app) => sum + (app.aggregateStat?.viewCount ?? 0),
    0,
  );
  const avgRating =
    featuredApps.length > 0
      ? featuredApps.reduce(
          (sum, app) => sum + Number(app.aggregateStat?.averageRating ?? 0),
          0,
        ) / featuredApps.length
      : 0;

  return (
    <Box
      component="section"
      className={cn(styles.heroSurface)}
      sx={{ p: { xs: 3, md: 4, lg: 5 } }}
    >
      <Box
        sx={{
          display: "grid",
          gap: 4,
          gridTemplateColumns: { xs: "1fr", lg: "1.12fr 0.88fr" },
        }}
      >
        <Stack spacing={3} sx={{ position: "relative", zIndex: 1 }}>
          <Chip
            label="Light, Fast, Creative"
            sx={{
              width: "fit-content",
              borderRadius: 999,
              border: "1px solid color-mix(in srgb, black 10%, transparent)",
              backgroundColor: "rgba(255,255,255,0.8)",
              textTransform: "uppercase",
              letterSpacing: "0.16em",
              fontSize: "0.65rem",
              fontWeight: 700,
              color: "#1f4fa8",
            }}
          />

          <Stack spacing={1.5}>
            <Typography
              component="h1"
              className={cn(displayClassName)}
              sx={{
                color: "#101624",
                fontSize: { xs: "2.35rem", md: "3rem" },
                lineHeight: 1.03,
                letterSpacing: "-0.03em",
                fontWeight: 700,
              }}
            >
              {heroTitle}
            </Typography>
            <Typography
              sx={{
                maxWidth: 720,
                color: "#4f5e78",
                fontSize: { xs: "1rem", md: "1.1rem" },
                lineHeight: 1.7,
              }}
            >
              {heroDescription}
            </Typography>
          </Stack>

          <Box
            component="form"
            action="/apps"
            method="get"
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: { sm: "center" },
              gap: 1.5,
            }}
          >
            <Input
              type="search"
              name="search"
              className={cn(styles.prismInput, "min-h-[48px] rounded-2xl")}
              placeholder="Search apps, categories, or developer names"
              aria-label="Search apps"
            />
            <Button
              type="submit"
              className={cn(styles.prismButton, "h-12 rounded-2xl px-6 min-w-[160px]")}
            >
              Search apps
            </Button>
          </Box>

          <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
            {[
              { href: "/apps?sort=latest", label: "New arrivals" },
              { href: "/apps?featured=true", label: "Staff picks" },
              { href: "/posts", label: "Insights" },
              { href: "/help", label: "Help guides" },
            ].map((item) => (
              <Button
                key={item.href}
                asChild
                variant="secondary"
                size="sm"
                className={cn(styles.chipLink, "text-[#14213a] uppercase tracking-wide")}
              >
                <Link href={item.href}>{item.label}</Link>
              </Button>
            ))}
          </Stack>

          <Box
            sx={{
              display: "grid",
              gap: 1.5,
              gridTemplateColumns: { xs: "1fr", sm: "repeat(3,minmax(0,1fr))" },
            }}
          >
            <Paper
              className={cn(styles.metricTile)}
              sx={{ p: 1.5 }}
              elevation={0}
            >
              <Typography
                sx={{
                  fontSize: "0.68rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "#5c6780",
                }}
              >
                Featured apps
              </Typography>
              <Typography
                sx={{
                  mt: 0.5,
                  fontSize: "1.6rem",
                  fontWeight: 700,
                  color: "#141b2b",
                }}
              >
                {featuredApps.length}
              </Typography>
            </Paper>
            <Paper
              className={cn(styles.metricTile)}
              sx={{ p: 1.5 }}
              elevation={0}
            >
              <Typography
                sx={{
                  fontSize: "0.68rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "#5c6780",
                }}
              >
                Downloads
              </Typography>
              <Typography
                sx={{
                  mt: 0.5,
                  fontSize: "1.6rem",
                  fontWeight: 700,
                  color: "#141b2b",
                }}
              >
                {formatCompactCount(totalDownloads)}
              </Typography>
            </Paper>
            <Paper
              className={cn(styles.metricTile)}
              sx={{ p: 1.5 }}
              elevation={0}
            >
              <Typography
                sx={{
                  fontSize: "0.68rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "#5c6780",
                }}
              >
                Average rating
              </Typography>
              <Typography
                sx={{
                  mt: 0.5,
                  fontSize: "1.6rem",
                  fontWeight: 700,
                  color: "#141b2b",
                }}
              >
                {formatRating(avgRating)}
              </Typography>
            </Paper>
          </Box>
        </Stack>

        <Stack spacing={2} sx={{ position: "relative", zIndex: 1 }}>
          <Paper
            className={cn(styles.mixCard, styles.floatingCard)}
            elevation={0}
            sx={{ overflow: "hidden", p: { xs: 2, md: 2.5 } }}
          >
            <Box
              className={cn(styles.sparkleLine)}
              sx={{
                position: "relative",
                overflow: "hidden",
                borderRadius: "16px",
                border: "1px solid color-mix(in srgb, black 10%, transparent)",
              }}
            >
              <Box
                sx={{
                  position: "relative",
                  aspectRatio: "16/10",
                  backgroundColor: "#eef4ff",
                }}
              >
                <Image
                  src={heroImage}
                  alt={heroTitle}
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover"
                  unoptimized
                />
              </Box>
            </Box>

            <Stack spacing={1.5} sx={{ mt: 2 }}>
              <Stack
                direction="row"
                spacing={1}
                sx={{ alignItems: "center", justifyContent: "space-between" }}
              >
                <Typography
                  sx={{
                    fontSize: "0.72rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.12em",
                    color: "#596a87",
                    fontWeight: 700,
                  }}
                >
                  Hero spotlight
                </Typography>
                <Chip
                  label={
                    spotlightApp?.isPaid
                      ? formatPrice(spotlightApp.price)
                      : "Free"
                  }
                  size="small"
                  sx={{
                    border:
                      "1px solid color-mix(in srgb, black 10%, transparent)",
                    backgroundColor: "#fff",
                    color: "#1f283d",
                    fontWeight: 700,
                  }}
                />
              </Stack>

              <Typography
                sx={{
                  fontSize: "1.38rem",
                  lineHeight: 1.2,
                  letterSpacing: "-0.02em",
                  color: "#111827",
                  fontWeight: 700,
                }}
              >
                {spotlightApp?.title ?? heroTitle}
              </Typography>
              <Typography
                sx={{ color: "#4f5e78", fontSize: "0.94rem" }}
                className="line-clamp-2"
              >
                {spotlightApp?.shortDescription ?? heroDescription}
              </Typography>

              <Stack
                direction="row"
                spacing={1}
                sx={{ flexWrap: "wrap", gap: 1 }}
              >
                <Button
                  asChild
                  className={cn(styles.prismButton)}
                  size="sm"
                >
                  <Link href={
                    heroSlider?.linkUrl ??
                    (spotlightApp ? `/apps/${spotlightApp.slug}` : "/apps")
                  }>Open spotlight</Link>
                </Button>
                <Button
                  asChild
                  variant="secondary"
                  className={cn(styles.secondaryPrismButton)}
                  size="sm"
                >
                  <Link href="/help-support">Get support</Link>
                </Button>
              </Stack>
            </Stack>
          </Paper>

          <Paper className={cn(styles.mixCard)} elevation={0} sx={{ p: 2 }}>
            <Typography
              sx={{
                fontSize: "0.68rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                color: "#5d6c86",
              }}
            >
              Today in motion
            </Typography>
            <Stack
              direction="row"
              spacing={1.5}
              sx={{
                mt: 1,
                alignItems: "flex-end",
                justifyContent: "space-between",
              }}
            >
              <Box>
                <Typography
                  sx={{
                    fontSize: "1.15rem",
                    fontWeight: 700,
                    color: "#101827",
                  }}
                >
                  {formatCompactCount(totalViews)} fresh views
                </Typography>
                <Typography sx={{ fontSize: "0.92rem", color: "#4f5e78" }}>
                  Across new launches this week.
                </Typography>
              </Box>
              {heroBanner?.imageUrl ? (
                <Image
                  src={heroBanner.imageUrl}
                  alt={heroBanner.title}
                  width={88}
                  height={88}
                  className="h-14 w-14 rounded-2xl border border-black/10 object-cover"
                  unoptimized
                />
              ) : null}
            </Stack>
          </Paper>
        </Stack>
      </Box>
    </Box>
  );
}
