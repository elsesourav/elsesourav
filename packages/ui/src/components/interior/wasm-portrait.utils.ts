export function parseMultiplier(val: string | number | undefined, defaultVal = 1.0): number {
  if (typeof val === 'number') return val;
  if (!val) return defaultVal;
  const parsed = parseFloat(String(val).replace('x', ''));
  return isNaN(parsed) || parsed <= 0 ? defaultVal : parsed;
}

export function parseEdgeAlgorithm(val: string | number | undefined): number {
  if (typeof val === 'number') return val;
  if (val === 'sobel') return 1;
  if (val === 'radial') return 2;
  return 0; // default: perimeter alpha
}

export function parseEdgeThreshold(val: string | number | undefined, defaultVal = 28): number {
  if (typeof val === 'number') return val;
  if (!val) return defaultVal;
  const parsed = parseInt(String(val), 10);
  return isNaN(parsed) ? defaultVal : Math.max(5, Math.min(120, parsed));
}

export function parseStarsCount(val: string | number | undefined, defaultVal = 32): number {
  if (typeof val === 'number') return val;
  if (val === 'off' || val === '0') return 0;
  if (!val) return defaultVal;
  const parsed = parseInt(String(val), 10);
  return isNaN(parsed) ? defaultVal : Math.max(0, Math.min(48, parsed));
}

export function parseHaloMultiplier(val: string | number | undefined, defaultVal = 1.0): number {
  if (typeof val === 'number') return val;
  if (val === 'off') return 0.0;
  return parseMultiplier(val, defaultVal);
}

export function parseOrbitsEnabled(val: string | number | boolean | undefined): number {
  if (typeof val === 'boolean') return val ? 1 : 0;
  if (typeof val === 'number') return val > 0 ? 1 : 0;
  if (val === 'disabled' || val === 'off' || val === 'false') return 0;
  return 1;
}

export function parseSpecksMultiplier(val: string | number | undefined, defaultVal = 1.0): number {
  if (typeof val === 'number') return val;
  if (val === 'off') return 0.0;
  return parseMultiplier(val, defaultVal);
}

export function parseClickForce(val: string | number | undefined, defaultVal = 1.0): number {
  return parseMultiplier(val, defaultVal);
}

export function parseBounceSpeed(val: string | number | undefined, defaultVal = 1.0): number {
  if (typeof val === 'number') return val;
  if (!val) return defaultVal;
  // If e.g. "8.2", "14.0", "3.5", calculate ratio to 8.2 standard
  const parsed = parseFloat(String(val).replace('x', ''));
  if (isNaN(parsed)) return defaultVal;
  if (parsed > 2.5) {
    return parsed / 8.2; // Convert raw spring constant to multiplier
  }
  return parsed;
}

export function parseIntroDuration(val: string | number | undefined, defaultVal = 1.6): number {
  if (typeof val === 'number') return val;
  if (val === 'none' || val === '0s') return 0.01;
  if (val === 'fast' || val === '0.8s') return 0.8;
  if (val === 'slow' || val === '2.8s') return 2.8;
  if (val === 'standard' || val === '1.6s') return 1.6;
  const parsed = parseFloat(String(val));
  return isNaN(parsed) ? defaultVal : Math.max(0.01, Math.min(5.0, parsed));
}

export function detectDeviceCapability(): { densityScale: number; glowScale: number } {
  if (typeof window === 'undefined') return { densityScale: 1.0, glowScale: 1.0 };
  const cores = navigator.hardwareConcurrency || 4;
  const memory = (navigator as unknown as { deviceMemory?: number }).deviceMemory || 4;
  const screenWidth = window.innerWidth;
  if (screenWidth < 640) {
    return cores >= 8
      ? { densityScale: 0.85, glowScale: 0.9 }
      : { densityScale: 0.75, glowScale: 0.8 };
  }
  if (cores >= 8 && memory >= 8) return { densityScale: 1.0, glowScale: 1.0 };
  if (cores <= 4) return { densityScale: 0.85, glowScale: 0.9 };
  return { densityScale: 1.0, glowScale: 1.0 };
}

export function detectAdaptiveResolution(): number {
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
