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
  pathSpread?: string;
  showPathGuide?: boolean;
  edgeAlgorithm?: string | number;
  edgeThreshold?: string | number;
  pinBottomEdge?: boolean | number;
  topParticleSize?: string | number;
  topParticleQuantity?: string | number;
  topParticleSpeed?: string | number;
  glowDistance?: string | number;
  backsideStars?: string | number;
  backsideHalo?: string | number;
  backsideOrbits?: string | number | boolean;
  backsideSpecks?: string | number;
  imageResolution?: string | number;
  imageResolutionDesktop?: string | number;
  imageResolutionTablet?: string | number;
  imageResolutionMobile?: string | number;
  clickForce?: string | number;
  bounceSpeed?: string | number;
  clickRadius?: string | number;
  hoverSpeed?: string | number;
  hoverRadius?: string | number;
  clickSpeed?: string | number;
  introDuration?: string | number;
  introSpread?: string | number;
  introPattern?: string | number;
  configDesktop?: string;
  configTablet?: string;
  configMobile?: string;
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
  pathSpread,
  showPathGuide = false,
  edgeAlgorithm,
  edgeThreshold,
  pinBottomEdge,
  topParticleSize,
  topParticleQuantity,
  topParticleSpeed,
  glowDistance,
  backsideStars,
  backsideHalo,
  backsideOrbits,
  backsideSpecks,
  imageResolution,
  imageResolutionDesktop,
  imageResolutionTablet,
  imageResolutionMobile,
  clickForce,
  bounceSpeed,
  clickRadius,
  hoverSpeed,
  hoverRadius,
  clickSpeed,
  introDuration,
  introSpread,
  introPattern,
  configDesktop,
  configTablet,
  configMobile,
}: AboutPortraitCardProps) {
  const { resolvedTheme, effectsLevel } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const detectTargetDevice = React.useCallback((): 'mobile' | 'tablet' | 'desktop' => {
    if (typeof window === 'undefined') return 'desktop';
    const width = window.innerWidth;
    const isCoarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
    const minDim = Math.min(window.innerWidth, window.innerHeight);

    if (width < 768) return 'mobile';
    const isTabletTouch = isCoarse && minDim >= 600 && minDim < 950 && width <= 1366;
    if ((width >= 768 && width < 1024) || isTabletTouch) return 'tablet';
    return 'desktop';
  }, []);

  const [activeDevice, setActiveDevice] = React.useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  React.useEffect(() => {
    const updateDevice = () => setActiveDevice(detectTargetDevice());
    updateDevice();
    window.addEventListener('resize', updateDevice);
    return () => window.removeEventListener('resize', updateDevice);
  }, [detectTargetDevice]);

  // Load device-specific configuration profile snapshot if available
  const activeProfile = React.useMemo(() => {
    const raw =
      activeDevice === 'mobile'
        ? configMobile
        : activeDevice === 'tablet'
          ? configTablet
          : configDesktop;
    if (!raw) return {};
    try {
      return JSON.parse(raw) as Record<string, string>;
    } catch {
      return {};
    }
  }, [activeDevice, configMobile, configTablet, configDesktop]);

  const effResolution =
    activeProfile['portrait_image_resolution'] ||
    (activeDevice === 'mobile'
      ? imageResolutionMobile || '144'
      : activeDevice === 'tablet'
        ? imageResolutionTablet || '192'
        : imageResolutionDesktop || imageResolution || '256');

  const effParticleDensity = activeProfile['portrait_particle_density'] || particleDensity;
  const effParticleSize = activeProfile['portrait_particle_size'] || particleSize;
  const effGlowBrightness = activeProfile['portrait_glow_brightness'] || glowBrightness;
  const effFlightSpeed = activeProfile['portrait_flight_speed'] || flightSpeed;
  const effPathSpread = activeProfile['portrait_path_spread'] || pathSpread;
  const effEdgeAlgorithm = activeProfile['portrait_edge_algorithm'] || edgeAlgorithm;
  const effEdgeThreshold = activeProfile['portrait_edge_threshold'] || edgeThreshold;
  const effPinBottom =
    activeProfile['portrait_pin_bottom_edge'] !== undefined
      ? activeProfile['portrait_pin_bottom_edge'] !== 'false'
      : pinBottomEdge;
  const effTopSize = activeProfile['portrait_top_particle_size'] || topParticleSize;
  const effTopQty = activeProfile['portrait_top_particle_quantity'] || topParticleQuantity;
  const effTopSpeed = activeProfile['portrait_top_particle_speed'] || topParticleSpeed;
  const effGlowDistance = activeProfile['portrait_glow_distance'] || glowDistance;
  const effStars = activeProfile['portrait_backside_stars'] || backsideStars;
  const effHalo = activeProfile['portrait_backside_halo'] || backsideHalo;
  const effOrbits = activeProfile['portrait_backside_orbits'] || backsideOrbits;
  const effSpecks = activeProfile['portrait_backside_specks'] || backsideSpecks;
  const effClickForce = activeProfile['portrait_click_force'] || clickForce;
  const effBounceSpeed = activeProfile['portrait_bounce_speed'] || bounceSpeed;
  const effClickRadius = activeProfile['portrait_click_radius'] || clickRadius;
  const effHoverSpeed = activeProfile['portrait_hover_speed'] || hoverSpeed;
  const effHoverRadius = activeProfile['portrait_hover_threshold'] || hoverRadius;
  const effClickSpeed = activeProfile['portrait_click_speed'] || clickSpeed;
  const effIntroDuration = activeProfile['portrait_intro_animation'] || introDuration;
  const effIntroSpread = activeProfile['portrait_intro_spread'] || introSpread;
  const effIntroPattern = activeProfile['portrait_intro_pattern'] || introPattern;
  const effLightIntensity = activeProfile['portrait_light_intensity']
    ? parseFloat(activeProfile['portrait_light_intensity'])
    : lightIntensity;

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

      {/* Main expanded clean portrait showcase with improved mobile sizing */}
      <div
        className="relative z-10 w-full rounded-xl sm:rounded-2xl md:rounded-3xl p-1 sm:p-2 border border-[hsl(var(--border-subtle))] sm:border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-lg sm:shadow-2xl backdrop-blur-2xl transition-all duration-300 mx-auto flex items-center justify-center max-w-[290px] min-[360px]:max-w-[320px] min-[480px]:max-w-[360px] min-[650px]:max-w-[390px] md:max-w-[420px] lg:max-w-[480px] xl:max-w-[520px]"
      >
        <WasmPortraitCanvas
          imageDarkSrc={imageDarkSrc}
          imageLightSrc={imageLightSrc}
          alt="Sourav Barui — WebAssembly C++ & WebGL Interactive Portrait"
          isDark={isDark}
          effectsLevel={effectsLevel}
          size={size}
          lightIntensity={effLightIntensity}
          simulationResolution={effResolution}
          particleDensity={effParticleDensity}
          particleSize={effParticleSize}
          glowBrightness={effGlowBrightness}
          flightSpeed={effFlightSpeed}
          pathSpread={effPathSpread}
          showPathGuide={showPathGuide}
          edgeAlgorithm={effEdgeAlgorithm}
          edgeThreshold={effEdgeThreshold}
          pinBottomEdge={effPinBottom}
          topParticleSize={effTopSize}
          topParticleQuantity={effTopQty}
          topParticleSpeed={effTopSpeed}
          glowDistance={effGlowDistance}
          backsideStars={effStars}
          backsideHalo={effHalo}
          backsideOrbits={effOrbits}
          backsideSpecks={effSpecks}
          clickForce={effClickForce}
          bounceSpeed={effBounceSpeed}
          clickRadius={effClickRadius}
          hoverSpeed={effHoverSpeed}
          hoverRadius={effHoverRadius}
          clickSpeed={effClickSpeed}
          introDuration={effIntroDuration}
          introSpread={effIntroSpread}
          introPattern={effIntroPattern}
          className="w-full shadow-inner border border-[hsl(var(--border-subtle))] rounded-2xl"
        />
      </div>
    </div>
  );
}
