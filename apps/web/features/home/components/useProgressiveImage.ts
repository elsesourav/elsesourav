'use client';

import * as React from 'react';

/**
 * Custom hook for progressive image loading (low-quality blur-up to high-quality).
 * Guarantees zero stuck blur with instant cache detection and fallback timeout.
 */
export function useProgressiveImage(highResSrc: string): [boolean, () => void] {
  const [isLoaded, setIsLoaded] = React.useState(false);

  const markLoaded = React.useCallback(() => {
    setIsLoaded(true);
  }, []);

  React.useEffect(() => {
    if (!highResSrc) return;

    // 1. Instant check for cached images
    const img = new Image();
    img.src = highResSrc;

    if (img.complete && img.naturalWidth > 0) {
      setIsLoaded(true);
      return;
    }

    // 2. Listen to network load
    img.onload = () => setIsLoaded(true);
    img.onerror = () => setIsLoaded(true);

    // 3. Safety fallback: never keep image blurred longer than 800ms
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 800);

    return () => {
      clearTimeout(timer);
      img.onload = null;
      img.onerror = null;
    };
  }, [highResSrc]);

  return [isLoaded, markLoaded];
}
