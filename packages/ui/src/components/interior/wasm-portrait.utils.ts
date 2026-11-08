export function parseMultiplier(val: string | number | undefined, defaultVal = 1.0): number {
  if (typeof val === 'number') return val;
  if (!val) return defaultVal;
  const parsed = parseFloat(String(val).replace('x', ''));
  return isNaN(parsed) || parsed <= 0 ? defaultVal : parsed;
}

export function detectDeviceCapability(): { densityScale: number; glowScale: number } {
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
