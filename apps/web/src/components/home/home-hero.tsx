"use client";

import { CompositeHeroCanvas } from "@/features/about-canvas/components/CompositeHeroCanvas";
import type { AdminImageConfig } from "@/lib/view-models";

type HomeHeroProps = {
  heroConfig?: AdminImageConfig | null;
};

export function HomeHero({ heroConfig }: HomeHeroProps) {
  // Extract metadata for text
  const metadata = heroConfig?.metadata as Record<string, unknown> | undefined;
  const title = (metadata?.title as string) || "Handcrafted digital experiences";
  const subtitle = (metadata?.subtitle as string) || "Discover high-quality apps, practical guides, and hands-on support workflows in one polished dashboard.";

  return (
    <div className="relative w-full h-[500px] md:h-[600px] rounded-3xl overflow-hidden shadow-2xl mb-12">
      <CompositeHeroCanvas 
        chunkSize={1} 
        alphaThreshold={20}
      >
        <div className="flex flex-col items-center justify-center pt-24 md:pt-32 text-center space-y-6 px-6 h-full relative z-20">
          <div className="flex flex-col gap-4 max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-text-primary drop-shadow-md">
              {title}
            </h1>
            <p className="text-lg md:text-xl text-text-primary leading-relaxed font-medium drop-shadow-sm max-w-2xl mx-auto">
              {subtitle}
            </p>
          </div>
          
          <img
            src={heroConfig?.url || "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=80"}
            alt="Hero Background"
            crossOrigin="anonymous"
            className="pointer-events-none hidden" // hidden but available for canvas drawing
          />
        </div>
      </CompositeHeroCanvas>
    </div>
  );
}
