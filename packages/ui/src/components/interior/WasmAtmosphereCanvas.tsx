'use client';

import * as React from 'react';
import { WasmAtmosphereBridge } from './wasm-atmosphere.bridge';

export interface WasmAtmosphereCanvasProps {
  isDark?: boolean;
  isSceneActive?: boolean;
  className?: string;
  particleDensityMultiplier?: number;
  speedMultiplier?: number;
  meteorFrequencyMultiplier?: number;
  mobileEffectsMode?: 'battery_saver' | 'standard' | 'enhanced';
  onLoaded?: () => void;
}

/**
 * Evaluates host device specifications to automatically compute a hardware-adaptive
 * scaling factor for particle density and draw detail.
 */
function detectAdaptiveHardwareMultiplier(
  isMobile: boolean,
  mobileEffectsMode: 'battery_saver' | 'standard' | 'enhanced' = 'standard'
): number {
  if (typeof window === 'undefined') return 1.0;

  // Base mobile scaling
  if (isMobile) {
    if (mobileEffectsMode === 'battery_saver') return 0.6;
    if (mobileEffectsMode === 'enhanced') return 1.15;
    return 0.85; // Standard mobile
  }

  try {
    const cores = navigator.hardwareConcurrency || 4;
    const memory = (navigator as unknown as { deviceMemory?: number }).deviceMemory || 4;

    // High-performance workstation / modern laptop (e.g., M1/M2/M3, 8+ cores, >= 8GB)
    if (cores >= 8 && memory >= 8) {
      return 1.35;
    }
    // Mid-tier machine (4-6 cores)
    if (cores >= 4) {
      return 1.0;
    }
    // Budget or power-constrained device
    return 0.75;
  } catch {
    return 1.0;
  }
}

export function WasmAtmosphereCanvas({
  isDark = true,
  isSceneActive = true,
  className = '',
  particleDensityMultiplier = 1.0,
  speedMultiplier = 1.0,
  meteorFrequencyMultiplier = 1.0,
  mobileEffectsMode = 'standard',
  onLoaded,
}: WasmAtmosphereCanvasProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const bridgeRef = React.useRef<WasmAtmosphereBridge | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const [isReady, setIsReady] = React.useState(false);

  // Compute combined density multiplier factoring hardware & admin preference
  const effectiveDensity = React.useMemo(() => {
    if (typeof window === 'undefined') return particleDensityMultiplier;
    const isMobile = window.innerWidth < 768;
    const hardwareMultiplier = detectAdaptiveHardwareMultiplier(isMobile, mobileEffectsMode);
    return Math.max(0.2, particleDensityMultiplier * hardwareMultiplier);
  }, [particleDensityMultiplier, mobileEffectsMode]);

  // Initialize WebAssembly & WebGL atmosphere bridge
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let bridge: WasmAtmosphereBridge | null = null;

    try {
      bridge = new WasmAtmosphereBridge({
        canvas,
        isDark,
        densityMultiplier: effectiveDensity,
        speedMultiplier,
        meteorFrequencyMultiplier,
        onLoaded: () => {
          setIsReady(true);
          onLoaded?.();
        },
      });

      bridgeRef.current = bridge;
      if (typeof window !== 'undefined') {
        (window as unknown as { __atmosphereBridge?: WasmAtmosphereBridge }).__atmosphereBridge = bridge;
      }
      bridge.resize();
    } catch {
      // Fallback
    }

    return () => {
      if (typeof window !== 'undefined') {
        delete (window as unknown as { __atmosphereBridge?: WasmAtmosphereBridge }).__atmosphereBridge;
      }
      bridge?.destroy();
      bridgeRef.current = null;
    };
  }, []);

  // Update theme dynamically
  React.useEffect(() => {
    bridgeRef.current?.setTheme(isDark);
  }, [isDark]);

  // Update density multiplier dynamically
  React.useEffect(() => {
    bridgeRef.current?.setDensityMultiplier(effectiveDensity);
  }, [effectiveDensity]);

  // Update speed dynamically
  React.useEffect(() => {
    bridgeRef.current?.setSpeedMultiplier(speedMultiplier);
  }, [speedMultiplier]);

  // Update meteor frequency dynamically
  React.useEffect(() => {
    bridgeRef.current?.setMeteorFrequency(meteorFrequencyMultiplier);
  }, [meteorFrequencyMultiplier]);

  // Handle scene activation (e.g. Tab visibility or performance mode)
  React.useEffect(() => {
    if (!bridgeRef.current) return;
    if (isSceneActive) {
      bridgeRef.current.start();
    } else {
      bridgeRef.current.stop();
    }
  }, [isSceneActive]);

  // ResizeObserver for fluid responsive scaling
  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let resizeTimer: ReturnType<typeof setTimeout> | null = null;
    const ro = new ResizeObserver(() => {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        bridgeRef.current?.resize();
      }, 50);
    });

    ro.observe(container);

    const onWinResize = () => {
      bridgeRef.current?.resize();
    };
    window.addEventListener('resize', onWinResize, { passive: true });

    return () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      ro.disconnect();
      window.removeEventListener('resize', onWinResize);
    };
  }, []);

  // IntersectionObserver to sleep rendering when scrolled offscreen
  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        if (entry.isIntersecting) {
          bridgeRef.current?.start();
        } else {
          bridgeRef.current?.stop();
        }
      },
      { threshold: 0.05 }
    );

    io.observe(container);
    return () => io.disconnect();
  }, []);

  // Interactive meteor trigger on click / tap
  const handleInteraction = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!bridgeRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width;
    const ny = (e.clientY - rect.top) / rect.height;
    bridgeRef.current.triggerShootingStar(nx, ny, true);
  };

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      onClick={handleInteraction}
      className={`absolute inset-0 w-full h-full pointer-events-auto select-none overflow-hidden z-[2] ${className}`}
    >
      <canvas
        ref={canvasRef}
        id="wasm-atmosphere-canvas"
        data-testid="wasm-atmosphere-canvas"
        className={`w-full h-full block transition-opacity duration-700 ease-out ${
          isReady ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          touchAction: 'none',
        }}
      />
    </div>
  );
}
