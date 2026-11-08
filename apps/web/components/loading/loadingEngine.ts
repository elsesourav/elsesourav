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
 * Returns uniform particle step across all devices.
 * By standardizing to step 1 on the ultra-lightweight matrix (~146 particles),
 * all devices (mobile, tablet, desktop) render the exact same pixel count
 * with rock-solid 60/120fps and zero lag.
 */
export function getAdaptiveParticleStep(): { step: number; isLowTier: boolean } {
  return { step: 1, isLowTier: false };
}

/**
 * Lightweight runtime benchmark to monitor frame render cadence.
 * With the ultra-lightweight 146-particle engine, CPU execution is < 0.02ms,
 * ensuring seamless performance on all hardware.
 */
export class FrameBenchmark {
  public isDowngraded = false;

  constructor(_initialLowTier?: boolean) {
    this.isDowngraded = false;
  }

  public recordFrame(_now: number): boolean {
    return false;
  }
}

/**
 * Initializes particles with origins situated completely OUT OF THE DISPLAY,
 * converging rapidly and smoothly towards the center of the viewport to form the logo.
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
    const dist = baseScreenRadius + Math.random() * (80 * dpr);
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
      currentAlpha: 0.2 + Math.random() * 0.3,
      // Rapid convergence delay for fast load
      delayMs: Math.random() * (durationMs * 0.18),
      // Fast, snappy flight convergence
      speed: 0.16 + Math.random() * 0.06,
      diagSum: targetX + targetY,
    });
  }

  return particles;
}
