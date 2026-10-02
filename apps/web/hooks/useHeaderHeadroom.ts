'use client';

import * as React from 'react';
import { useHideOnScroll } from '@elsesourav/ui/interior';

export interface UseHeaderHeadroomOptions {
  /** Minimum scroll delta in pixels required to hide on downward scroll @default 14 */
  threshold?: number;
  /** Minimum scroll delta in pixels required to reveal on upward scroll @default 6 */
  upThreshold?: number;
  /** Distance from page top (in pixels) where the header is guaranteed visible @default 64 */
  topOffset?: number;
  /** When true, header visibility is locked to visible @default false */
  isLocked?: boolean;
}

export interface UseHeaderHeadroomReturn {
  /** Whether the header is currently visible */
  isVisible: boolean;
  /** Whether the page has been scrolled down past the top guard */
  isScrolled: boolean;
  /** Ref to attach to the `<header>` element for automatic focus tracking */
  headerRef: React.RefObject<HTMLElement | null>;
}

/**
 * Standard headroom wrapper delegating directly to @elsesourav/ui/interior useHideOnScroll.
 */
export function useHeaderHeadroom({
  threshold = 14,
  upThreshold = 6,
  topOffset = 64,
  isLocked = false,
}: UseHeaderHeadroomOptions = {}): UseHeaderHeadroomReturn {
  const { isVisible, isScrolled, ref } = useHideOnScroll<HTMLElement>({
    hideAfter: threshold,
    revealAfter: upThreshold,
    topGuard: topOffset,
    pinned: isLocked,
    useWindow: true,
  });

  return {
    isVisible,
    isScrolled,
    headerRef: ref,
  };
}
