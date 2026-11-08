'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { WasmPortraitBridge } from './wasm-portrait.bridge';

export interface WasmPortraitCanvasProps {
  imageDarkSrc?: string;
  imageLightSrc?: string;
  alt?: string;
  className?: string;
  isDark?: boolean;
  effectsLevel?: 'high' | 'medium' | 'low';
  size?: number;
  lightIntensity?: number;
  simulationResolution?: number;
  particleDensity?: string | number;
  particleSize?: string | number;
  glowBrightness?: string | number;
  flightSpeed?: string | number;
}

function parseMultiplier(val: string | number | undefined, defaultVal = 1.0): number {
  if (typeof val === 'number') return val;
  if (!val) return defaultVal;
  const parsed = parseFloat(String(val).replace('x', ''));
  return isNaN(parsed) || parsed <= 0 ? defaultVal : parsed;
}

function detectDeviceCapability(): { densityScale: number; glowScale: number } {
  if (typeof window === 'undefined') return { densityScale: 1.0, glowScale: 1.0 };
  const cores = navigator.hardwareConcurrency || 4;
  const memory = (navigator as unknown as { deviceMemory?: number }).deviceMemory || 4;
  const screenWidth = window.innerWidth;
  if (screenWidth < 640) {
    return cores >= 8 ? { densityScale: 0.85, glowScale: 0.9 } : { densityScale: 0.75, glowScale: 0.8 };
  }
  if (cores >= 8 && memory >= 8) return { densityScale: 1.0, glowScale: 1.0 };
  if (cores <= 4) return { densityScale: 0.85, glowScale: 0.9 };
  return { densityScale: 1.0, glowScale: 1.0 };
}

function detectAdaptiveResolution(): number {
  if (typeof window === 'undefined') return 224;

  const dpr = window.devicePixelRatio || 1;
  const cores = navigator.hardwareConcurrency || 4;
  const memory = (navigator as unknown as { deviceMemory?: number }).deviceMemory || 4;
  const screenWidth = window.innerWidth;
  const isMobile = screenWidth < 640;
  const isTablet = screenWidth >= 640 && screenWidth < 1024;

  if (isMobile) {
    if (cores >= 8 && dpr >= 2.5) return 200;
    if (cores >= 6) return 176;
    return 160;
  }

  if (isTablet) {
    if (cores >= 8 && dpr >= 2) return 240;
    return 200;
  }

  // High configuration desktop: 8+ CPU cores, high DPI, 8GB+ RAM
  if (cores >= 8 && dpr >= 1.5 && memory >= 8) {
    return 256;
  }

  if (cores >= 6) {
    return 224;
  }

  return 192;
}

export function WasmPortraitCanvas({
  imageDarkSrc = '/about/souravbarui-dark-512.webp',
  imageLightSrc = '/about/souravbarui-light-512.webp',
  alt = 'Sourav Barui — Portrait',
  className = '',
  isDark = true,
  effectsLevel: _effectsLevel = 'high',
  size = 460,
  lightIntensity = 0.38,
  simulationResolution,
  particleDensity = '1.0x',
  particleSize = '1.0x',
  glowBrightness = '1.0x',
  flightSpeed = '1.0x',
}: WasmPortraitCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasMountRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const bridgeRef = useRef<WasmPortraitBridge | null>(null);
  const introTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sizeRef = useRef(size);
  sizeRef.current = size;

  const rawDensity = parseMultiplier(particleDensity);
  const rawSize = parseMultiplier(particleSize);
  const rawGlow = parseMultiplier(glowBrightness);
  const rawSpeed = parseMultiplier(flightSpeed);

  const { densityScale, glowScale } = detectDeviceCapability();
  const effectiveDensity = rawDensity * densityScale;
  const effectiveGlow = rawGlow * glowScale;

  const [isInView, setIsInView] = useState(true);
  const [isWasmActive, setIsWasmActive] = useState(false);
  const [hasWebGLError, setHasWebGLError] = useState(false);

  const activeSrc = isDark ? imageDarkSrc : imageLightSrc;

  const getCardRect = useCallback((): DOMRect | null => {
    return containerRef.current?.getBoundingClientRect() ?? null;
  }, []);

  const switchToCard = useCallback(() => {
    const canvas = canvasRef.current;
    const bridge = bridgeRef.current;
    const mount = canvasMountRef.current;
    if (!canvas || !bridge) return;

    if (introTimerRef.current) {
      clearTimeout(introTimerRef.current);
      introTimerRef.current = null;
    }

    if (mount && canvas.parentElement !== mount) {
      mount.appendChild(canvas);
    }

    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.zIndex = '20';
    canvas.style.pointerEvents = 'none';
    canvas.style.background = 'transparent';

    const currentSize = sizeRef.current;
    canvas.width = currentSize;
    canvas.height = currentSize;

    bridge.setFullscreenMode(false);
    bridge.resize(currentSize, currentSize);
  }, []);

  const switchToFullscreen = useCallback(() => {
    const canvas = canvasRef.current;
    const bridge = bridgeRef.current;
    if (!canvas || !bridge || typeof window === 'undefined') return;

    if (introTimerRef.current) clearTimeout(introTimerRef.current);

    if (canvas.parentElement !== document.body) {
      document.body.appendChild(canvas);
    }

    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.zIndex = '99999';
    canvas.style.pointerEvents = 'none';
    canvas.style.background = 'transparent';

    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = w;
    canvas.height = h;

    bridge.resize(w, h);
    bridge.setFullscreenMode(true, getCardRect);
    bridge.start();
    bridge.triggerEntrance(2.4);

    introTimerRef.current = setTimeout(() => {
      switchToCard();
    }, 2500);
  }, [getCardRect, switchToCard]);

  // 1. Ingest image into WASM engine whenever image loads or source changes
  const handleImageLoad = useCallback(() => {
    if (bridgeRef.current && imgRef.current) {
      bridgeRef.current.ingestImageElement(imgRef.current);
    }
  }, []);

  // 2. High-precision Viewport Scroll Observer (Power-saving: stops when a portion is scrolled off)
  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry) {
          const isFullyVisible = entry.isIntersecting && entry.intersectionRatio >= 0.90;
          setIsInView(isFullyVisible);
          if (isFullyVisible) {
            bridgeRef.current?.start();
          } else {
            bridgeRef.current?.pause();
          }
        }
      },
      { rootMargin: '0px', threshold: [0, 0.25, 0.5, 0.75, 0.90, 0.98, 1.0] }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // 3. Initialize Single Canvas & WASM Bridge (Mounts once on client)
  useEffect(() => {
    const mount = canvasMountRef.current;
    if (!mount) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Create single canvas DOM element
    const canvas = document.createElement('canvas');
    canvas.id = 'wasm-portrait-canvas';
    canvas.setAttribute('data-testid', 'wasm-portrait-canvas');
    canvasRef.current = canvas;
    mount.appendChild(canvas);

    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.zIndex = '20';
    canvas.style.pointerEvents = 'none';
    canvas.style.background = 'transparent';

    canvas.width = size;
    canvas.height = size;

    const effectiveSimRes = simulationResolution || detectAdaptiveResolution();

    const bridge = new WasmPortraitBridge({
      canvas,
      imageDarkSrc,
      imageLightSrc,
      isDark,
      lightIntensity,
      simulationResolution: effectiveSimRes,
      particleDensity: effectiveDensity,
      particleSize: rawSize,
      glowBrightness: effectiveGlow,
      flightSpeed: rawSpeed,
      onLoaded: () => {
        setIsWasmActive(true);
        if (bridge && !bridge.isWebGLActive()) {
          setHasWebGLError(true);
        }
        if (!prefersReducedMotion) {
          switchToFullscreen();
        } else {
          switchToCard();
          bridge.triggerEntrance(0.01);
        }
      },
    });

    bridge.start();
    bridgeRef.current = bridge;
    if (typeof window !== 'undefined') {
      (window as unknown as { __portraitBridge?: WasmPortraitBridge }).__portraitBridge = bridge;
    }

    if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth > 0) {
      bridge.ingestImageElement(imgRef.current);
    }

    return () => {
      if (introTimerRef.current) {
        clearTimeout(introTimerRef.current);
        introTimerRef.current = null;
      }
      bridge.dispose();
      bridgeRef.current = null;
      canvas.remove();
      canvasRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageDarkSrc, imageLightSrc]);

  // 4. Entrance animation trigger on About page click / navigation
  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const handleAboutActivate = () => {
      if (prefersReducedMotion) {
        switchToCard();
        bridgeRef.current?.triggerEntrance(0.01);
      } else {
        switchToFullscreen();
      }
    };

    window.addEventListener('elsesourav:about-activate', handleAboutActivate);
    return () => window.removeEventListener('elsesourav:about-activate', handleAboutActivate);
  }, [switchToFullscreen, switchToCard]);

  // 5. Dynamic outside size synchronization
  useEffect(() => {
    if (bridgeRef.current && size > 0 && canvasRef.current && canvasRef.current.parentElement !== document.body) {
      canvasRef.current.width = size;
      canvasRef.current.height = size;
      bridgeRef.current.resize(size, size);
    }
  }, [size]);

  // 6. Theme & lighting intensity synchronization
  useEffect(() => {
    if (bridgeRef.current) {
      bridgeRef.current.setTheme(isDark);
      if (lightIntensity !== undefined) {
        bridgeRef.current.setLightIntensity(lightIntensity);
      }
      if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth > 0) {
        bridgeRef.current.ingestImageElement(imgRef.current);
      }
    }
  }, [isDark, activeSrc, lightIntensity]);

  // 6b. Dynamic particle multipliers synchronization
  useEffect(() => {
    if (bridgeRef.current) {
      bridgeRef.current.setDensity(effectiveDensity);
      bridgeRef.current.setParticleSize(rawSize);
      bridgeRef.current.setGlowBrightness(effectiveGlow);
      bridgeRef.current.setFlightSpeed(rawSpeed);
    }
  }, [effectiveDensity, rawSize, effectiveGlow, rawSpeed]);

  // 7. Tab visibility pause
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        bridgeRef.current?.pause();
      } else if (isInView) {
        bridgeRef.current?.start();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [isInView]);

  // 8. Pointer and touch physics interaction
  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!bridgeRef.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    bridgeRef.current.setPointer(x, y, false);
  }, []);

  const handlePointerLeave = useCallback(() => {
    if (!bridgeRef.current) return;
    bridgeRef.current.setPointer(-999, -999, false);
  }, []);

  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!bridgeRef.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    bridgeRef.current.burst(x, y);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (!bridgeRef.current || !containerRef.current) return;
    const touch = e.touches[0];
    if (!touch) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -(((touch.clientY - rect.top) / rect.height) * 2 - 1);
    bridgeRef.current.setPointer(x, y, true);
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!bridgeRef.current) return;
    bridgeRef.current.setPointer(-999, -999, false);
  }, []);

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onTouchStart={handleTouchMove}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={handleClick}
      className={`relative select-none touch-none overflow-hidden rounded-3xl group cursor-crosshair ${className}`}
      style={{
        width: '100%',
        maxWidth: `${size}px`,
        aspectRatio: '1 / 1',
      }}
      aria-label={`${alt}. Interactive WebAssembly C++ portrait. Touch or hover to displace pixels.`}
      role="img"
    >
      {/* LAYER 0 (z-0): Ambient soft back-glow behind WebGL pixel ring */}
      <div
        className={`absolute inset-16 rounded-full blur-3xl pointer-events-none z-0 transition-opacity duration-700 ${
          isDark
            ? 'bg-gradient-to-tr from-cyan-500/25 via-indigo-600/20 to-purple-500/30 opacity-70'
            : 'bg-gradient-to-tr from-sky-400/20 via-blue-500/15 to-indigo-500/20 opacity-60'
        }`}
        aria-hidden="true"
      />

      {/* LAYER 1 (z-10): Original Base Portrait Photo (ONLY shown if WebGL fails completely) */}
      <img
        ref={imgRef}
        src={activeSrc}
        alt={alt}
        crossOrigin="anonymous"
        onLoad={handleImageLoad}
        className={`absolute inset-0 w-full h-full object-contain pointer-events-none z-10 transition-opacity duration-700 ${
          hasWebGLError ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        loading="eager"
        decoding="async"
      />

      {/* LAYER 1.5 (z-15): High-Tech Loading Screen (active until WASM & textures initialize before intro flight) */}
      {!isWasmActive && !hasWebGLError && (
        <div
          data-testid="portrait-loading-screen"
          className="absolute inset-0 z-15 flex flex-col items-center justify-center p-4 bg-zinc-950/70 dark:bg-zinc-950/85 backdrop-blur-xl rounded-2xl select-none transition-opacity duration-500"
        >
          {/* Animated Pulsing Matrix Ring */}
          <div className="relative flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 mb-3 sm:mb-3.5">
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-cyan-500/30 via-indigo-500/25 to-purple-500/30 blur-lg animate-pulse" />
            <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-full border-2 border-indigo-500/20 border-t-cyan-400 border-r-indigo-400 animate-spin" />
            <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee] animate-ping" />
          </div>

          <div className="text-xs sm:text-sm font-semibold text-zinc-200 font-mono tracking-wider flex items-center gap-1">
            <span>Loading Portrait</span>
            <span className="inline-flex text-cyan-400">
              <span className="animate-pulse">.</span>
              <span className="animate-pulse [animation-delay:200ms]">.</span>
              <span className="animate-pulse [animation-delay:400ms]">.</span>
            </span>
          </div>
          <span className="text-[10px] text-zinc-500 font-mono mt-1">WebAssembly C++ Engine</span>
        </div>
      )}

      {/* LAYER 2 (z-20): Single WebAssembly C++ & WebGL Canvas Mount Container */}
      <div ref={canvasMountRef} className="absolute inset-0 pointer-events-none z-20" />
    </div>
  );
}
