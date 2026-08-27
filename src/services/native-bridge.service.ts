import { Capacitor } from '@capacitor/core';
import { isSafeExternalUrl, isSafeUrl } from '@/utils/url-safety';
import { mobileConfig } from '@/config/mobile.config';

export interface ShareOptions {
  readonly title: string;
  readonly text?: string;
  readonly url?: string;
}

export class NativeBridgeService {
  /**
   * Returns true if currently running inside an Android or iOS Capacitor native wrapper.
   */
  public isNative(): boolean {
    try {
      return Capacitor.isNativePlatform();
    } catch {
      return false;
    }
  }

  /**
   * Returns current execution platform: 'android', 'ios', or 'web'.
   */
  public getPlatform(): 'android' | 'ios' | 'web' {
    try {
      const p = Capacitor.getPlatform();
      if (p === 'android' || p === 'ios') return p;
      return 'web';
    } catch {
      return 'web';
    }
  }

  /**
   * Safely opens an external URL in a browser or external app.
   */
  public async openExternalUrl(url: string, target = '_blank'): Promise<boolean> {
    if (!isSafeExternalUrl(url)) {
      return false;
    }

    try {
      if (typeof window !== 'undefined') {
        const win = window.open(url, target, 'noopener,noreferrer');
        return win !== null;
      }
      return false;
    } catch {
      return false;
    }
  }

  /**
   * Shares content using Web Share API or falls back gracefully to clipboard.
   */
  public async share(options: ShareOptions): Promise<boolean> {
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: options.title,
          text: options.text,
          url: options.url,
        });
        return true;
      } catch (err) {
        // AbortError indicates user cancelled share dialog - treat as non-error
        if (err instanceof Error && err.name === 'AbortError') {
          return true;
        }
      }
    }

    // Fallback: Copy URL or text to clipboard if available
    const shareText = options.url || options.text || options.title;
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(shareText);
        return true;
      } catch {
        return false;
      }
    }

    return false;
  }

  /**
   * Parses deep links from custom scheme (elsesourav://...) or Universal Links (https://elsesourav.com/...)
   * into a standard internal SPA route path.
   */
  public parseDeepLink(rawUrl: string): string | null {
    if (!rawUrl || typeof rawUrl !== 'string') return null;

    const trimmed = rawUrl.trim();

    // 1. Custom Scheme: elsesourav://path
    const customPrefix = `${mobileConfig.deepLinks.customScheme}://`;
    if (trimmed.startsWith(customPrefix)) {
      const pathPart = trimmed.slice(customPrefix.length);
      const lower = pathPart.toLowerCase();
      if (
        lower.startsWith('javascript:') ||
        lower.startsWith('data:') ||
        lower.startsWith('vbscript:') ||
        lower.startsWith('file:')
      ) {
        return null;
      }

      const normalizedPath = pathPart.startsWith('/') ? pathPart : `/${pathPart}`;
      return isSafeUrl(normalizedPath) ? normalizedPath : null;
    }

    // 2. Universal / App Links: https://elsesourav.com/path
    try {
      const url = new URL(trimmed);
      const isConfiguredDomain = mobileConfig.deepLinks.universalDomains.some(
        (domain) => url.hostname === domain || url.hostname.endsWith(`.${domain}`)
      );

      if (isConfiguredDomain) {
        const fullPath = `${url.pathname}${url.search}${url.hash}`;
        return isSafeUrl(fullPath) ? fullPath : null;
      }
    } catch {
      // Invalid URL format
    }

    return null;
  }

  /**
   * Handles incoming deep links and executes navigation if valid.
   */
  public handleDeepLink(rawUrl: string, navigate: (path: string) => void): boolean {
    const internalPath = this.parseDeepLink(rawUrl);
    if (internalPath) {
      navigate(internalPath);
      return true;
    }
    return false;
  }
}

export const nativeBridge = new NativeBridgeService();
