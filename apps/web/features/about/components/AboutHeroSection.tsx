import React from 'react';
import Link from 'next/link';
import { Button, Badge } from '@elsesourav/ui';
import { Terminal, BookOpen } from 'lucide-react';
import { ROUTES } from '@elsesourav/config';
import { AboutPortraitCard } from './AboutPortraitCard';
import { BlogContentRenderer } from '@/features/blog/components/BlogContentRenderer';

export interface AboutHeroSectionProps {
  creator: {
    fullName?: string | null;
    name: string;
    title: string;
    longBio?: string | null;
  };
  site: {
    portraitLightIntensity?: number;
    portraitImageDarkUrl?: string;
    portraitImageLightUrl?: string;
    portraitParticleDensity?: string;
    portraitParticleSize?: string;
    portraitGlowBrightness?: string;
    portraitFlightSpeed?: string;
    portraitPathSpread?: string;
    portraitEdgeAlgorithm?: string;
    portraitEdgeThreshold?: string;
    portraitPinBottomEdge?: string;
    portraitTopParticleSize?: string;
    portraitTopParticleQuantity?: string;
    portraitTopParticleSpeed?: string;
    portraitGlowDistance?: string;
    portraitBacksideStars?: string;
    portraitBacksideHalo?: string;
    portraitBacksideOrbits?: string;
    portraitBacksideSpecks?: string;
    portraitImageResolution?: string;
    portraitImageResolutionDesktop?: string;
    portraitImageResolutionTablet?: string;
    portraitImageResolutionMobile?: string;
    portraitClickForce?: string;
    portraitBounceSpeed?: string;
    portraitClickRadius?: string;
    portraitHoverSpeed?: string;
    portraitHoverThreshold?: string;
    portraitClickSpeed?: string;
    portraitIntroAnimation?: string;
    portraitIntroSpread?: string;
    portraitIntroPattern?: string;
  };
}

export function AboutHeroSection({ creator, site }: AboutHeroSectionProps) {
  const displayName = creator.fullName || `${creator.name} Barui`;

  return (
    <section
      data-section="hero-profile"
      aria-labelledby="creator-bio-heading"
      className="space-y-3 sm:space-y-4"
    >
      {/* Minimal Clean Header Eyebrow */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 sm:pb-3 border-b border-[hsl(var(--border-subtle))]">
        <div className="flex items-center gap-2">
          <h1 className="text-[11px] sm:text-xs md:text-sm font-bold uppercase tracking-wider text-[hsl(var(--foreground))] font-mono">
            About the Creator
          </h1>
          <Badge variant="primary" className="text-[9px] sm:text-[10px] md:text-xs px-1.5 py-0.2 sm:px-2 sm:py-0.5 font-mono">
            Independent Studio
          </Badge>
        </div>
      </div>

      {/* Main Profile Showcase Card */}
      <div className="p-3 sm:p-5 md:p-8 lg:p-10 rounded-2xl sm:rounded-3xl border border-[hsl(var(--border-subtle))] sm:border-[hsl(var(--border))] bg-[hsl(var(--card))] backdrop-blur-xl shadow-xl sm:shadow-2xl">
        <div className="grid grid-cols-1 min-[650px]:grid-cols-12 gap-4 sm:gap-6 lg:gap-10 xl:gap-12 items-center">
          {/* Interactive Portrait (Centered on Mobile < 650, Side-by-Side >= 650) */}
          <div className="min-[650px]:col-span-6 lg:col-span-6 xl:col-span-7 flex items-center justify-center w-full mx-auto">
            <AboutPortraitCard
              lightIntensity={site.portraitLightIntensity}
              imageDarkSrc={site.portraitImageDarkUrl || '/about/souravbarui-dark.png'}
              imageLightSrc={site.portraitImageLightUrl || '/about/souravbarui-light.png'}
              particleDensity={site.portraitParticleDensity}
              particleSize={site.portraitParticleSize}
              glowBrightness={site.portraitGlowBrightness}
              flightSpeed={site.portraitFlightSpeed}
              pathSpread={site.portraitPathSpread}
              edgeAlgorithm={site.portraitEdgeAlgorithm}
              edgeThreshold={site.portraitEdgeThreshold}
              pinBottomEdge={site.portraitPinBottomEdge !== 'false'}
              topParticleSize={site.portraitTopParticleSize}
              topParticleQuantity={site.portraitTopParticleQuantity}
              topParticleSpeed={site.portraitTopParticleSpeed}
              glowDistance={site.portraitGlowDistance}
              backsideStars={site.portraitBacksideStars}
              backsideHalo={site.portraitBacksideHalo}
              backsideOrbits={site.portraitBacksideOrbits}
              backsideSpecks={site.portraitBacksideSpecks}
              imageResolution={site.portraitImageResolution}
              imageResolutionDesktop={site.portraitImageResolutionDesktop}
              imageResolutionTablet={site.portraitImageResolutionTablet}
              imageResolutionMobile={site.portraitImageResolutionMobile}
              clickForce={site.portraitClickForce}
              bounceSpeed={site.portraitBounceSpeed}
              clickRadius={site.portraitClickRadius}
              hoverSpeed={site.portraitHoverSpeed}
              hoverRadius={site.portraitHoverThreshold}
              clickSpeed={site.portraitClickSpeed}
              introDuration={site.portraitIntroAnimation}
              introSpread={site.portraitIntroSpread}
              introPattern={site.portraitIntroPattern}
            />
          </div>

          {/* Bio & Creator Overview */}
          <div className="min-[650px]:col-span-6 lg:col-span-6 xl:col-span-5 space-y-3 sm:space-y-4 text-center min-[650px]:text-left">
            <div className="pb-2.5 sm:pb-3.5 border-b border-[hsl(var(--border-subtle))]">
              <h2
                id="creator-bio-heading"
                className="text-lg min-[400px]:text-xl min-[650px]:text-2xl lg:text-3xl font-bold text-[hsl(var(--foreground))] tracking-tight"
              >
                {displayName}
              </h2>
              <p className="text-[11px] sm:text-xs md:text-sm font-semibold text-indigo-600 dark:text-cyan-400 font-mono mt-0.5 sm:mt-1">
                {creator.title}
              </p>
            </div>

            <div className="space-y-2 sm:space-y-3 text-[hsl(var(--foreground))] text-xs min-[650px]:text-sm sm:text-base leading-relaxed text-left">
              {creator.longBio ? (
                <BlogContentRenderer content={creator.longBio} />
              ) : (
                <p>
                  Sourav Barui is an independent software creator who enjoys turning ideas into
                  useful software, tools, games, and experiments. ElseSourav is his personal
                  software studio, digital workshop, and engineering archive.
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-center min-[650px]:justify-start gap-2 pt-2.5 sm:pt-3 border-t border-[hsl(var(--border-subtle))]">
              <Link href={ROUTES.APPS}>
                <Button
                  size="xs"
                  leftIcon={<Terminal className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
                  className="text-[11px] sm:text-xs font-semibold px-2.5 py-1.5 sm:px-3 sm:py-2"
                >
                  Explore Apps
                </Button>
              </Link>
              <Link href={ROUTES.UPDATES}>
                <Button
                  variant="secondary"
                  size="xs"
                  leftIcon={<BookOpen className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
                  className="text-[11px] sm:text-xs px-2.5 py-1.5 sm:px-3 sm:py-2"
                >
                  Read Updates
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
