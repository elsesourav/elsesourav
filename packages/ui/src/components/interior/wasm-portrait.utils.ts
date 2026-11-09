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
  if (typeof val === 'boolean') return val ? 2 : 0;
  if (typeof val === 'number') return Math.max(0, Math.min(4, val));
  if (val === 'disabled' || val === 'off' || val === 'false' || val === '0') return 0;
  if (val === 'enabled') return 2;
  const parsed = parseInt(String(val), 10);
  return isNaN(parsed) ? 2 : Math.max(0, Math.min(4, parsed));
}

export function parseSpecksMultiplier(val: string | number | undefined, defaultVal = 1.0): number {
  if (typeof val === 'number') return val;
  if (val === 'off') return 0.0;
  return parseMultiplier(val, defaultVal);
}

export function parseClickForce(val: string | number | undefined, defaultVal = 1.0): number {
  if (typeof val === 'number') return Math.min(1.8, Math.max(0.1, val));
  if (!val) return defaultVal;
  const parsed = parseFloat(String(val).replace('x', ''));
  return isNaN(parsed) ? defaultVal : Math.min(1.8, Math.max(0.1, parsed));
}

export function parseBounceSpeed(val: string | number | undefined, defaultVal = 1.0): number {
  if (typeof val === 'number') return val;
  if (!val) return defaultVal;
  const parsed = parseFloat(String(val).replace('x', ''));
  if (isNaN(parsed)) return defaultVal;
  if (parsed > 1.2) {
    return parsed / 8.2; // Convert raw spring constant to multiplier
  }
  return parsed;
}

export function parseIntroDuration(val: string | number | undefined, defaultVal = 1.0): number {
  if (typeof val === 'number') return val;
  if (val === 'instant' || val === '0s') return 0.01;
  if (val === 'brisk' || val === '0.6s') return 0.6;
  if (val === 'standard' || val === '1.0s') return 1.0;
  if (val === 'cinematic' || val === '1.6s') return 1.6;
  const parsed = parseFloat(String(val).replace('s', ''));
  return isNaN(parsed) ? defaultVal : Math.max(0.01, Math.min(5.0, parsed));
}

export function parseGlowDistance(val: string | number | undefined, defaultVal = 1.0): number {
  if (typeof val === 'number') return val;
  if (!val) return defaultVal;
  const parsed = parseFloat(String(val).replace('px', ''));
  if (isNaN(parsed)) return defaultVal;
  return Math.max(0.3, Math.min(4.0, parsed / 8.0));
}

export function parseClickRadius(val: string | number | undefined, defaultVal = 1.0): number {
  if (typeof val === 'number') return val;
  if (val === 'full' || val === 'all') return 10.0;
  if (!val) return defaultVal;
  const parsed = parseFloat(String(val).replace('px', ''));
  if (isNaN(parsed)) return defaultVal;
  return Math.max(0.2, Math.min(10.0, parsed / 80.0));
}

export function resolveDeviceResolution(
  settings: Record<string, string>,
  defaultVal = 224
): number {
  if (typeof window === 'undefined') return defaultVal;
  const w = window.innerWidth;
  if (w < 640) {
    const mobile = settings['portrait_image_resolution_mobile'];
    if (mobile) return parseInt(mobile, 10) || 144;
  } else if (w < 1024) {
    const tablet = settings['portrait_image_resolution_tablet'];
    if (tablet) return parseInt(tablet, 10) || 192;
  } else {
    const desktop = settings['portrait_image_resolution_desktop'];
    if (desktop) return parseInt(desktop, 10) || 256;
  }
  const global = settings['portrait_image_resolution'];
  return global ? parseInt(global, 10) || defaultVal : defaultVal;
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
    if (cores >= 8 && dpr >= 2.5) return 192;
    if (cores >= 6) return 160;
    return 144;
  }

  if (isTablet) {
    if (cores >= 8 && dpr >= 2) return 224;
    return 192;
  }

  if (cores >= 8 && dpr >= 1.5 && memory >= 8) {
    return 256;
  }

  if (cores >= 6) {
    return 224;
  }

  return 192;
}
