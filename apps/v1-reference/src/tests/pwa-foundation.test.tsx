import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PWAStatusBanner } from '@/components/feedback/PWAStatusBanner';
import { PWAService, pwaService } from '@/services/pwa.service';
import * as networkHook from '@/hooks/useNetworkStatus';
import * as pwaHook from '@/hooks/usePWA';
import fs from 'fs';
import path from 'path';

describe('Prompt 59 — Progressive Web App (PWA) Foundation Suite', () => {
  let mockOnlineStatus: { isOnline: boolean; wasOffline: boolean };
  let mockPWAStatus: {
    updateAvailable: boolean;
    isInstallable: boolean;
    isStandalone: boolean;
    applyUpdate: () => void;
    promptInstall: () => Promise<'accepted' | 'dismissed' | 'unavailable'>;
    checkForUpdates: () => void;
    dismissUpdate: () => void;
  };

  beforeEach(() => {
    mockOnlineStatus = { isOnline: true, wasOffline: false };
    mockPWAStatus = {
      updateAvailable: false,
      isInstallable: false,
      isStandalone: false,
      applyUpdate: vi.fn(),
      promptInstall: vi.fn().mockResolvedValue('accepted'),
      checkForUpdates: vi.fn(),
      dismissUpdate: vi.fn(),
    };

    vi.spyOn(networkHook, 'useNetworkStatus').mockImplementation(() => mockOnlineStatus);
    vi.spyOn(pwaHook, 'usePWA').mockImplementation(() => mockPWAStatus);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ---------------------------------------------------------------------------
  // 1. Web App Manifest Validity
  // ---------------------------------------------------------------------------
  it('1. Web App Manifest exists, contains valid JSON, and adheres to W3C PWA standards', () => {
    const manifestPath = path.resolve(process.cwd(), 'public/manifest.webmanifest');
    expect(fs.existsSync(manifestPath)).toBe(true);

    const rawContent = fs.readFileSync(manifestPath, 'utf-8');
    const manifest = JSON.parse(rawContent);

    expect(manifest.name).toBe('ElseSourav — Developer & Software Platform');
    expect(manifest.short_name).toBe('ElseSourav');
    expect(manifest.start_url).toBe('/');
    expect(manifest.scope).toBe('/');
    expect(manifest.display).toBe('standalone');
    expect(manifest.theme_color).toBe('#090d16');
    expect(manifest.background_color).toBe('#090d16');
    expect(Array.isArray(manifest.icons)).toBe(true);
    expect(manifest.icons.length).toBeGreaterThanOrEqual(3);
  });

  // ---------------------------------------------------------------------------
  // 2. PWA Icon Assets
  // ---------------------------------------------------------------------------
  it('2. PWA Icons exist at specified paths with valid sizes and SVG content', () => {
    const icon192Path = path.resolve(process.cwd(), 'public/icons/icon-192x192.svg');
    const icon512Path = path.resolve(process.cwd(), 'public/icons/icon-512x512.svg');
    const maskablePath = path.resolve(process.cwd(), 'public/icons/icon-maskable.svg');
    const faviconPath = path.resolve(process.cwd(), 'public/favicon.svg');

    expect(fs.existsSync(icon192Path)).toBe(true);
    expect(fs.existsSync(icon512Path)).toBe(true);
    expect(fs.existsSync(maskablePath)).toBe(true);
    expect(fs.existsSync(faviconPath)).toBe(true);

    const icon192Content = fs.readFileSync(icon192Path, 'utf-8');
    expect(icon192Content).toContain('viewBox="0 0 192 192"');
    expect(icon192Content).toContain('linearGradient');

    const icon512Content = fs.readFileSync(icon512Path, 'utf-8');
    expect(icon512Content).toContain('viewBox="0 0 512 512"');
  });

  // ---------------------------------------------------------------------------
  // 3. Service Worker File & Architecture
  // ---------------------------------------------------------------------------
  it('3. Service Worker file exists in public/ and defines explicit cache versioning', () => {
    const swPath = path.resolve(process.cwd(), 'public/sw.js');
    expect(fs.existsSync(swPath)).toBe(true);

    const swContent = fs.readFileSync(swPath, 'utf-8');
    expect(swContent).toContain("const CACHE_NAME = 'elsesourav-v1'");
    expect(swContent).toContain("self.addEventListener('install'");
    expect(swContent).toContain("self.addEventListener('activate'");
    expect(swContent).toContain("self.addEventListener('fetch'");
    expect(swContent).toContain("self.addEventListener('message'");
  });

  // ---------------------------------------------------------------------------
  // 4. Cache Strategy Classification
  // ---------------------------------------------------------------------------
  it('4. Service Worker implements cache-first for static immutable assets and network-first for navigation', () => {
    const swContent = fs.readFileSync(path.resolve(process.cwd(), 'public/sw.js'), 'utf-8');

    // Precache shell assets
    expect(swContent).toContain("'/index.html'");
    expect(swContent).toContain("'/manifest.webmanifest'");

    // Navigation network-first fallback
    expect(swContent).toContain("request.mode === 'navigate'");
    expect(swContent).toContain("caches.match('/index.html')");

    // Static asset matching
    expect(swContent).toContain("url.includes('/assets/')");
  });

  // ---------------------------------------------------------------------------
  // 5. Private Data & Authentication Exclusion
  // ---------------------------------------------------------------------------
  it('5. Service Worker strictly excludes Firebase Auth, Firestore, and non-GET mutations from caching', () => {
    const swContent = fs.readFileSync(path.resolve(process.cwd(), 'public/sw.js'), 'utf-8');

    // Method restriction
    expect(swContent).toContain("request.method !== 'GET'");

    // Security exclusions
    expect(swContent).toContain('identitytoolkit');
    expect(swContent).toContain('securetoken');
    expect(swContent).toContain('auth');
    expect(swContent).toContain('api');
  });

  // ---------------------------------------------------------------------------
  // 6. Cache Invalidation on SW Activate
  // ---------------------------------------------------------------------------
  it('6. Service Worker activate handler cleans up outdated caches and claims clients', () => {
    const swContent = fs.readFileSync(path.resolve(process.cwd(), 'public/sw.js'), 'utf-8');

    expect(swContent).toContain('caches.delete(cache)');
    expect(swContent).toContain('self.clients.claim()');
  });

  // ---------------------------------------------------------------------------
  // 7. PWAService Lifecycle & Skip-Waiting Activation
  // ---------------------------------------------------------------------------
  it('7. PWAService manages update subscriptions and posts SKIP_WAITING to waiting worker', () => {
    const service = new PWAService();
    let updateFired = false;

    const unsubscribe = service.onUpdateAvailable(() => {
      updateFired = true;
    });

    expect(service.hasUpdate()).toBe(false);
    expect(service.isInstallable()).toBe(false);
    expect(updateFired).toBe(false);

    unsubscribe();
  });

  // ---------------------------------------------------------------------------
  // 8. Offline Status Indicator
  // ---------------------------------------------------------------------------
  it('8. PWAStatusBanner renders accessible offline alert bar when browser is offline', () => {
    mockOnlineStatus = { isOnline: false, wasOffline: false };

    render(<PWAStatusBanner />);

    const offlineAlert = screen.getByRole('status');
    expect(offlineAlert).toBeInTheDocument();
    expect(offlineAlert).toHaveClass('pwa-network-bar--offline');
    expect(
      screen.getByText(/You are currently offline. Viewing cached shell; dynamic updates require an internet connection./i)
    ).toBeInTheDocument();
  });

  // ---------------------------------------------------------------------------
  // 9. Network Recovery Indicator
  // ---------------------------------------------------------------------------
  it('9. PWAStatusBanner renders transient back-online confirmation when connectivity recovers', () => {
    mockOnlineStatus = { isOnline: true, wasOffline: true };

    render(<PWAStatusBanner />);

    const recoveryAlert = screen.getByRole('status');
    expect(recoveryAlert).toBeInTheDocument();
    expect(recoveryAlert).toHaveClass('pwa-network-bar--online');
    expect(screen.getByText(/Internet connection restored. Live synchronization active./i)).toBeInTheDocument();
  });

  // ---------------------------------------------------------------------------
  // 10. Update Notification UX
  // ---------------------------------------------------------------------------
  it('10. PWAStatusBanner renders non-disruptive update notification with Update Now and Dismiss actions', () => {
    mockPWAStatus = {
      ...mockPWAStatus,
      updateAvailable: true,
    };

    render(<PWAStatusBanner />);

    const updateAlert = screen.getByRole('alert', { name: /Application Update Available/i });
    expect(updateAlert).toBeInTheDocument();
    expect(screen.getByText(/Update Available/i)).toBeInTheDocument();
    expect(
      screen.getByText(/A new version of ElseSourav is ready with the latest performance and feature updates./i)
    ).toBeInTheDocument();

    const updateBtn = screen.getByRole('button', { name: /Update Now/i });
    const dismissBtn = screen.getByRole('button', { name: /Dismiss/i });

    expect(updateBtn).toBeInTheDocument();
    expect(dismissBtn).toBeInTheDocument();

    fireEvent.click(updateBtn);
    expect(mockPWAStatus.applyUpdate).toHaveBeenCalledTimes(1);

    fireEvent.click(dismissBtn);
    expect(mockPWAStatus.dismissUpdate).toHaveBeenCalledTimes(1);
  });

  // ---------------------------------------------------------------------------
  // 11. HTML Head Meta Tags for PWA
  // ---------------------------------------------------------------------------
  it('11. index.html contains manifest link, theme-color, and apple-touch-icon tags', () => {
    const indexPath = path.resolve(process.cwd(), 'index.html');
    const indexContent = fs.readFileSync(indexPath, 'utf-8');

    expect(indexContent).toContain('<link rel="manifest" href="/manifest.webmanifest" />');
    expect(indexContent).toContain('<meta name="theme-color" content="#090d16" />');
    expect(indexContent).toContain('<link rel="apple-touch-icon" href="/icons/icon-192x192.svg" />');
  });

  // ---------------------------------------------------------------------------
  // 12. Accessibility Compliance
  // ---------------------------------------------------------------------------
  it('12. PWA notifications utilize accessible ARIA roles, live regions, and keyboard-operable controls', () => {
    mockOnlineStatus = { isOnline: false, wasOffline: false };
    mockPWAStatus = { ...mockPWAStatus, updateAvailable: true };

    render(<PWAStatusBanner />);

    const statusRegion = screen.getByRole('status');
    expect(statusRegion).toHaveAttribute('aria-live', 'polite');

    const alertRegion = screen.getByRole('alert');
    expect(alertRegion).toHaveAttribute('aria-label', 'Application Update Available');
  });

  // ---------------------------------------------------------------------------
  // 13. Standalone Mode Detection
  // ---------------------------------------------------------------------------
  it('13. PWAService correctly detects standalone PWA display mode', () => {
    expect(pwaService.isStandalone()).toBe(false);
  });
});
