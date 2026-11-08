'use client';

import React from 'react';
import { WasmPortraitCanvas } from '@elsesourav/ui/interior';
import { useTheme } from '@/components/theme/ThemeProvider';

export interface AboutPortraitCardProps {
  className?: string;
  size?: number;
  lightIntensity?: number;
  imageDarkSrc?: string;
  imageLightSrc?: string;
  particleDensity?: string;
  particleSize?: string;
  glowBrightness?: string;
  flightSpeed?: string;
  showPathGuide?: boolean;
}

export function AboutPortraitCard({
  className = '',
  size = 520,
  lightIntensity = 0.38,
  imageDarkSrc = '/about/souravbarui-dark.png',
  imageLightSrc = '/about/souravbarui-light.png',
  particleDensity,
  particleSize,
  glowBrightness,
  flightSpeed,
  showPathGuide = false,
}: AboutPortraitCardProps) {
  const { resolvedTheme, effectsLevel } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <div
      className={`relative group flex flex-col items-center justify-center w-full mx-auto ${className}`}
      data-testid="about-portrait-card"
    >
      {/* Dynamic ambient multi-layer halo glow */}
      <div
        className={`absolute -inset-3 sm:-inset-6 rounded-3xl blur-2xl sm:blur-3xl opacity-40 sm:opacity-60 group-hover:opacity-80 transition-opacity duration-700 pointer-events-none ${
          isDark
            ? 'bg-gradient-to-tr from-cyan-500/25 via-indigo-600/20 to-purple-500/30'
            : 'bg-gradient-to-tr from-cyan-400/25 via-indigo-500/20 to-purple-500/25'
        }`}
        aria-hidden="true"
      />

      {/* Main expanded clean portrait showcase with responsive sizing */}
      <div
        className="relative z-10 w-full rounded-xl sm:rounded-2xl md:rounded-3xl p-1 sm:p-2 border border-[hsl(var(--border-subtle))] sm:border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-lg sm:shadow-2xl backdrop-blur-2xl transition-all duration-300 mx-auto flex items-center justify-center max-w-[210px] min-[380px]:max-w-[250px] min-[500px]:max-w-[290px] min-[650px]:max-w-[340px] md:max-w-[380px] lg:max-w-[460px] xl:max-w-[500px]"
      >
        <WasmPortraitCanvas
          imageDarkSrc={imageDarkSrc}
          imageLightSrc={imageLightSrc}
          alt="Sourav Barui — WebAssembly C++ & WebGL Interactive Portrait"
          isDark={isDark}
          effectsLevel={effectsLevel}
          size={size}
          lightIntensity={lightIntensity}
          particleDensity={particleDensity}
          particleSize={particleSize}
          glowBrightness={glowBrightness}
          flightSpeed={flightSpeed}
          showPathGuide={showPathGuide}
          className="w-full shadow-inner border border-[hsl(var(--border-subtle))] rounded-2xl"
        />
      </div>
    </div>
  );
}
