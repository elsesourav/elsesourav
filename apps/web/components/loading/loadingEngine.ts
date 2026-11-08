import type { LogoPixelTuple } from './logoPixelData';

export interface LoadingParticle {
  targetX: number;
  targetY: number;
  currentX: number;
  currentY: number;
  r: number;
  g: number;
  b: number;
  targetAlpha: number;
  currentAlpha: number;
  delayMs: number;
  speed: number;
  diagSum: number;
}

/**
 * Calculates adaptive particle step based on device performance & screen size.
 * Low-end mobile: subsamples by 4 (~600 particles) for silky 60fps.
 * Mid-tier devices: subsamples by 2 (~1,200 particles).
 * High-end desktop: step 1 (full 2,433 particles).
 */
export function getAdaptiveParticleStep(): { step: number; isLowTier: boolean } {
  if (typeof window === 'undefined') {
    return { step: 1, isLowTier: false };
  }

  // Respect reduced-motion preferences
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return { step: 4, isLowTier: true };
  }

  const width = window.innerWidth;
  const cores = navigator.hardwareConcurrency || 4;
  const memory = (navigator as unknown as { deviceMemory?: number }).deviceMemory || 4;

  // Low-end mobile device (small screen + limited cores/memory)
  if (width < 640 && (cores <= 4 || memory <= 4)) {
    return { step: 4, isLowTier: true };
  }

  // Mid-tier mobile or small tablet
  if (width < 1024 || cores <= 4) {
    return { step: 2, isLowTier: false };
  }

  // High-end desktop / modern laptop
  return { step: 1, isLowTier: false };
}

/**
 * Lightweight 100ms runtime benchmark to monitor frame render cadence.
 * If frame delta exceeds 24ms (< 42fps), dynamically downgrades heavy canvas blurs
 * to guarantee fluid 60fps playback without lag on any hardware.
 */
export class FrameBenchmark {
  private frameCount = 0;
  private lastTime = 0;
  private totalDelta = 0;
  public isDowngraded: boolean;

  constructor(initialLowTier: boolean) {
    this.isDowngraded = initialLowTier;
  }

  /**
   * Samples frame delta during the first 100-140ms.
   * Returns true if heavy effects (shadowBlur) should be disabled.
   */
  public recordFrame(now: number): boolean {
    if (this.isDowngraded) return true;

    if (this.lastTime === 0) {
      this.lastTime = now;
      return false;
    }

    const dt = now - this.lastTime;
    this.lastTime = now;

    if (this.frameCount < 8) {
      this.frameCount += 1;
      this.totalDelta += dt;

      // Single frame hitch > 35ms or average > 24ms triggers downgrade
      if (dt > 35 || (this.frameCount === 8 && this.totalDelta / 8 > 24)) {
        this.isDowngraded = true;
      }
    }

    return this.isDowngraded;
  }
}

/**
 * Initializes particles with origins situated completely OUT OF THE DISPLAY,
 * converging towards the center of the viewport to form the logo.
 */
export function createParticlesFromPixels(
  pixels: readonly LogoPixelTuple[],
  cx: number,
  cy: number,
  pixelUnit: number,
  viewWidth: number,
  viewHeight: number,
  dpr: number,
  step: number,
  durationMs: number,
  prefersReducedMotion: boolean
): LoadingParticle[] {
  // Screen perimeter radius guarantee: distance from center to outside screen corners
  const baseScreenRadius = Math.hypot(viewWidth, viewHeight) * 0.53;
  const particles: LoadingParticle[] = [];

  for (let i = 0; i < pixels.length; i += step) {
    const p = pixels[i];
    if (!p) continue;

    const [gridX, gridY, r, g, b, alpha] = p;
    const targetX = cx + (gridX - 32) * pixelUnit;
    const targetY = cy + (gridY - 32) * pixelUnit;

    if (prefersReducedMotion) {
      particles.push({
        targetX,
        targetY,
        currentX: targetX,
        currentY: targetY,
        r,
        g,
        b,
        targetAlpha: alpha,
        currentAlpha: alpha,
        delayMs: 0,
        speed: 1,
        diagSum: targetX + targetY,
      });
      continue;
    }

    // Origin strictly outside the viewport perimeter with randomized launch vectors
    const angle = Math.random() * Math.PI * 2;
    const dist = baseScreenRadius + Math.random() * (120 * dpr);
    const startX = cx + Math.cos(angle) * dist;
    const startY = cy + Math.sin(angle) * dist;

    particles.push({
      targetX,
      targetY,
      currentX: startX,
      currentY: startY,
      r,
      g,
      b,
      targetAlpha: alpha,
      currentAlpha: 0.15 + Math.random() * 0.25,
      delayMs: Math.random() * (durationMs * 0.32),
      speed: 0.075 + Math.random() * 0.045,
      diagSum: targetX + targetY,
    });
  }

  return particles;
}
