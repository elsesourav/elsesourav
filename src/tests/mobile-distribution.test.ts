import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mobileConfig } from '@/config/mobile.config';
import { appConfig } from '@/config/app.config';
import packageJson from '../../package.json';
import { nativeBridge } from '@/services/native-bridge.service';

describe('Mobile Distribution & Native Packaging Architecture (Prompt 81)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Task 3, 4 & 5: Mobile Configuration & Identifiers', () => {
    it('defines stable reverse-domain application identifiers for Android and iOS', () => {
      expect(mobileConfig.appId).toBe('com.elsesourav.app');
      expect(mobileConfig.appName).toBe('ElseSourav');
      expect(mobileConfig.webDir).toBe('dist');
    });

    it('synchronizes mobile versioning with package.json and appConfig', () => {
      expect(mobileConfig.version).toBe(packageJson.version);
      expect(mobileConfig.version).toBe(appConfig.version);
      expect(mobileConfig.buildNumber).toBeGreaterThanOrEqual(1);
    });

    it('configures secure HTTPS schemes for mobile webview containers', () => {
      expect(mobileConfig.server.androidScheme).toBe('https');
      expect(mobileConfig.server.iosScheme).toBe('https');
      expect(mobileConfig.server.hostname).toBe('elsesourav.com');
    });

    it('enforces strict zero unnecessary device permissions policy', () => {
      expect(mobileConfig.permissions.camera).toBe(false);
      expect(mobileConfig.permissions.microphone).toBe(false);
      expect(mobileConfig.permissions.location).toBe(false);
      expect(mobileConfig.permissions.contacts).toBe(false);
      expect(mobileConfig.permissions.photos).toBe(false);
      expect(mobileConfig.permissions.bluetooth).toBe(false);
    });
  });

  describe('Task 7 & 8: Native Platform Bridge & Deep Linking', () => {
    it('identifies platform correctly and defaults safely to web in standard browsers', () => {
      expect(nativeBridge.isNative()).toBe(false);
      expect(nativeBridge.getPlatform()).toBe('web');
    });

    it('parses custom scheme deep links into valid internal SPA routes', () => {
      const parsedApp = nativeBridge.parseDeepLink('elsesourav://apps/terminal-pro');
      expect(parsedApp).toBe('/apps/terminal-pro');

      const parsedBlog = nativeBridge.parseDeepLink('elsesourav://blog/modern-architecture');
      expect(parsedBlog).toBe('/blog/modern-architecture');

      const parsedSupport = nativeBridge.parseDeepLink('elsesourav://support');
      expect(parsedSupport).toBe('/support');
    });

    it('parses Universal / App Links into valid internal SPA routes', () => {
      const parsed = nativeBridge.parseDeepLink('https://elsesourav.com/apps/cloud-canvas?tab=reviews#top');
      expect(parsed).toBe('/apps/cloud-canvas?tab=reviews#top');

      const parsedSubdomain = nativeBridge.parseDeepLink('https://www.elsesourav.com/help/faq');
      expect(parsedSubdomain).toBe('/help/faq');
    });

    it('rejects malicious or third-party deep link targets', () => {
      expect(nativeBridge.parseDeepLink('https://malicious-site.com/steal-creds')).toBeNull();
      expect(nativeBridge.parseDeepLink('elsesourav://javascript:alert(1)')).toBeNull();
      expect(nativeBridge.parseDeepLink('elsesourav://data:text/html,<script>')).toBeNull();
    });

    it('executes navigation callback on valid deep links', () => {
      const navigateMock = vi.fn();
      const handled = nativeBridge.handleDeepLink('elsesourav://library', navigateMock);

      expect(handled).toBe(true);
      expect(navigateMock).toHaveBeenCalledWith('/library');
    });

    it('safely rejects unsafe URLs during external URL navigation', async () => {
      const result = await nativeBridge.openExternalUrl('javascript:alert(1)');
      expect(result).toBe(false);
    });
  });
});
