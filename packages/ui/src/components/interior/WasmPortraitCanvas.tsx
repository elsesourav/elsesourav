'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { WasmPortraitBridge } from './wasm-portrait.bridge';
import {
  parseMultiplier,
  parseEdgeAlgorithm,
  parseEdgeThreshold,
  parseStarsCount,
  parseHaloMultiplier,
  parseOrbitsEnabled,
  parseSpecksMultiplier,
  parseClickForce,
  parseBounceSpeed,
  parseIntroDuration,
  parseGlowDistance,
  parseClickRadius,
  detectDeviceCapability,
  detectAdaptiveResolution,
} from './wasm-portrait.utils';

export interface WasmPortraitCanvasProps {
  imageDarkSrc?: string;
  imageLightSrc?: string;
  alt?: string;
  className?: string;
  isDark?: boolean;
  effectsLevel?: 'high' | 'medium' | 'low';
  size?: number;
  lightIntensity?: number;
  simulationResolution?: number | string;
  particleDensity?: string | number;
  particleSize?: string | number;
  glowBrightness?: string | number;
  flightSpeed?: string | number;
  pathSpread?: string | number;
  showPathGuide?: boolean;
  // Advanced Customizations
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
  clickForce?: string | number;
  bounceSpeed?: string | number;
  clickRadius?: string | number;
  introDuration?: string | number;
}

export function WasmPortraitCanvas({
  imageDarkSrc = '/about/souravbarui-dark.png',
  imageLightSrc = '/about/souravbarui-light.png',
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
  pathSpread = '2.4px',
  showPathGuide = false,
  edgeAlgorithm = 0,
  edgeThreshold = 28,
  pinBottomEdge = 1,
  topParticleSize = '1.0x',
  topParticleQuantity = '1.0x',
  topParticleSpeed = '1.0x',
  glowDistance = '8px',
  backsideStars = 32,
  backsideHalo = '1.0x',
  backsideOrbits = 2,
  backsideSpecks = '1.0x',
  clickForce = '1.0x',
  bounceSpeed = '1.0x',
  clickRadius = '80px',
  introDuration = '1.0s',
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

  // Parsed custom values
  const effAlgorithm = parseEdgeAlgorithm(edgeAlgorithm);
  const effThreshold = parseEdgeThreshold(edgeThreshold);
  const effPinBottom = pinBottomEdge === false || pinBottomEdge === 0 ? 0 : 1;
  const effTopSize = parseMultiplier(topParticleSize);
  const effTopQty = parseMultiplier(topParticleQuantity);
  const effTopSpeed = parseMultiplier(topParticleSpeed);
  const effStars = parseStarsCount(backsideStars);
  const effHalo = parseHaloMultiplier(backsideHalo);
  const effOrbits = parseOrbitsEnabled(backsideOrbits);
  const effSpecks = parseSpecksMultiplier(backsideSpecks);
  const effClickForce = parseClickForce(clickForce);
  const effBounceSpeed = parseBounceSpeed(bounceSpeed);
  const effGlowDistance = parseGlowDistance(glowDistance);
  const effClickRadius = parseClickRadius(clickRadius);
  const effIntroDuration = parseIntroDuration(introDuration);

  const [isWasmActive, setIsWasmActive] = useState(false);
  const [hasWebGLError, setHasWebGLError] = useState(false);

  const effectiveDarkSrc = imageDarkSrc || '/about/souravbarui-dark.png';
  const effectiveLightSrc = imageLightSrc || '/about/souravbarui-light.png';
  const activeSrc = isDark ? effectiveDarkSrc : effectiveLightSrc;

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
    bridge.triggerEntrance(0.01);
  }, []);

  const switchToFullscreen = useCallback(() => {
    const canvas = canvasRef.current;
    const bridge = bridgeRef.current;
    if (!canvas || !bridge || typeof window === 'undefined') return;

    // Mobile Height / SVH fix: skip fullscreen reparenting on mobile devices
    // to prevent mobile address bar shift and canvas resize jumping
    const isMobile = window.innerWidth < 650 || 'ontouchstart' in window;
    if (isMobile) {
      switchToCard();
      bridge.triggerEntrance(effIntroDuration);
      return;
    }

    if (introTimerRef.current) clearTimeout(introTimerRef.current);

    if (canvas.parentElement !== document.body) {
      document.body.appendChild(canvas);
    }

    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100svh';
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
    bridge.triggerEntrance(effIntroDuration);

    const flightWait = Math.round(effIntroDuration * 1000 + 100);
    introTimerRef.current = setTimeout(() => {
      switchToCard();
    }, flightWait);
  }, [getCardRect, switchToCard, effIntroDuration]);

  const handleImageLoad = useCallback(() => {
    if (bridgeRef.current && imgRef.current) {
      bridgeRef.current.ingestImageElement(imgRef.current);
    }
  }, []);

  // Viewport scroll observer
  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry) {
          const isFullyVisible = entry.isIntersecting && entry.intersectionRatio >= 0.9;
          if (isFullyVisible) {
            bridgeRef.current?.start();
          } else {
            bridgeRef.current?.pause();
          }
        }
      },
      { rootMargin: '0px', threshold: [0, 0.25, 0.5, 0.75, 0.9, 0.98, 1.0] }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Initialize Canvas & Bridge
  useEffect(() => {
    const mount = canvasMountRef.current;
    if (!mount) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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

    const parsedSimRes =
      typeof simulationResolution === 'string'
        ? parseInt(simulationResolution, 10)
        : simulationResolution;
    const effectiveSimRes = parsedSimRes || detectAdaptiveResolution();

    const bridge = new WasmPortraitBridge({
      canvas,
      imageDarkSrc: effectiveDarkSrc,
      imageLightSrc: effectiveLightSrc,
      isDark,
      lightIntensity,
      simulationResolution: effectiveSimRes,
      particleDensity: effectiveDensity,
      particleSize: rawSize,
      glowBrightness: effectiveGlow,
      flightSpeed: rawSpeed,
      pathSpread,
      showPathGuide,
      edgeAlgorithm: effAlgorithm,
      edgeThreshold: effThreshold,
      pinBottomEdge: effPinBottom,
      topParticleSize: effTopSize,
      topParticleQuantity: effTopQty,
      topParticleSpeed: effTopSpeed,
      backsideStars: effStars,
      backsideHalo: effHalo,
      backsideOrbits: effOrbits,
      backsideSpecks: effSpecks,
      clickForce: effClickForce,
      bounceSpeed: effBounceSpeed,
      glowDistance: effGlowDistance,
      clickRadius: effClickRadius,
      onLoaded: () => {
        setIsWasmActive(true);
        if (bridge && !bridge.isWebGLActive()) {
          setHasWebGLError(true);
        }
        if (!prefersReducedMotion && effIntroDuration > 0.05) {
          switchToFullscreen();
        } else {
          switchToCard();
          bridge.triggerEntrance(0.01);
        }
      },
    });

    bridge.start();
    bridgeRef.current = bridge;

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
  }, [effectiveDarkSrc, effectiveLightSrc, simulationResolution]);

  // Synchronize dynamic settings
  useEffect(() => {
    if (bridgeRef.current) {
      bridgeRef.current.setTheme(isDark);
      if (lightIntensity !== undefined) bridgeRef.current.setLightIntensity(lightIntensity);
      bridgeRef.current.setDensity(effectiveDensity);
      bridgeRef.current.setParticleSize(rawSize);
      bridgeRef.current.setGlowBrightness(effectiveGlow);
      bridgeRef.current.setFlightSpeed(rawSpeed);
      if (pathSpread !== undefined) bridgeRef.current.setPathSpread(pathSpread);
      bridgeRef.current.setShowPathGuide(showPathGuide);
      bridgeRef.current.setEdgeAlgorithm(effAlgorithm);
      bridgeRef.current.setEdgeThreshold(effThreshold);
      bridgeRef.current.setPinBottomEdge(effPinBottom);
      bridgeRef.current.setTopParticleSize(effTopSize);
      bridgeRef.current.setTopParticleQuantity(effTopQty);
      bridgeRef.current.setTopParticleSpeed(effTopSpeed);
      bridgeRef.current.setBacksideStars(effStars);
      bridgeRef.current.setBacksideHalo(effHalo);
      bridgeRef.current.setBacksideOrbits(effOrbits);
      bridgeRef.current.setBacksideSpecks(effSpecks);
      bridgeRef.current.setClickForce(effClickForce);
      bridgeRef.current.setBounceSpeed(effBounceSpeed);
      bridgeRef.current.setGlowDistance(effGlowDistance);
      bridgeRef.current.setClickRadius(effClickRadius);
      if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth > 0) {
        bridgeRef.current.ingestImageElement(imgRef.current);
      }
    }
  }, [
    isDark,
    lightIntensity,
    effectiveDensity,
    rawSize,
    effectiveGlow,
    rawSpeed,
    pathSpread,
    showPathGuide,
    effAlgorithm,
    effThreshold,
    effPinBottom,
    effTopSize,
    effTopQty,
    effTopSpeed,
    effStars,
    effHalo,
    effOrbits,
    effSpecks,
    effClickForce,
    effBounceSpeed,
    effGlowDistance,
    effClickRadius,
  ]);

  // Pointer & Touch interactions
  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!bridgeRef.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = 1 - ((e.clientY - rect.top) / rect.height) * 2;
    bridgeRef.current.setPointer(x, y, true);
    bridgeRef.current.burst(x, y);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!bridgeRef.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = 1 - ((e.clientY - rect.top) / rect.height) * 2;
    bridgeRef.current.setPointer(x, y, false);
  }, []);

  const handlePointerLeave = useCallback(() => {
    bridgeRef.current?.setPointer(-999, -999, false);
  }, []);

  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!bridgeRef.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = 1 - ((e.clientY - rect.top) / rect.height) * 2;
    bridgeRef.current.burst(x, y);
  }, []);

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onPointerUp={handlePointerLeave}
      onClick={handleClick}
      className={`relative select-none overflow-hidden touch-none cursor-pointer ${className}`}
      style={{ width: '100%', maxWidth: `${size}px`, aspectRatio: '1 / 1' }}
      aria-label={alt}
      role="img"
    >
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

      {!isWasmActive && !hasWebGLError && (
        <div
          data-testid="portrait-loading-screen"
          className="absolute inset-0 z-15 flex flex-col items-center justify-center p-4 bg-zinc-950/70 dark:bg-zinc-950/85 backdrop-blur-xl rounded-2xl select-none transition-opacity duration-500"
        >
          <div className="relative flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 mb-3 sm:mb-3.5">
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-cyan-500/30 via-indigo-500/25 to-purple-500/30 blur-lg animate-pulse" />
            <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-full border-2 border-indigo-500/20 border-t-cyan-400 border-r-indigo-400 animate-spin" />
            <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee] animate-ping" />
          </div>
          <div className="text-xs sm:text-sm font-semibold text-zinc-200 font-mono tracking-wider">
            Loading Portrait...
          </div>
        </div>
      )}

      <div ref={canvasMountRef} className="absolute inset-0 pointer-events-none z-20" />
    </div>
  );
}
