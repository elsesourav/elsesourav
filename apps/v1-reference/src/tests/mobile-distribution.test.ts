import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mobileConfig } from '@/config/mobile.config';
import { appConfig } from '@/config/app.config';
import packageJson from '../../package.json';
import { nativeBridge } from '@/services/native-bridge.service';
import fs from 'node:fs';
import path from 'node:path';

describe('Mobile Distribution & Deep-Link Architecture (Prompt 81 & 82)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Task 1 & 2: Mobile Configuration & Android App Links', () => {
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

    it('validates Android assetlinks.json format and package matching', () => {
      const assetlinksPath = path.resolve(process.cwd(), 'public/.well-known/assetlinks.json');
      expect(fs.existsSync(assetlinksPath)).toBe(true);

      const content = JSON.parse(fs.readFileSync(assetlinksPath, 'utf8'));
      expect(Array.isArray(content)).toBe(true);
      expect(content[0].target.package_name).toBe(mobileConfig.appId);
      expect(content[0].target.sha256_cert_fingerprints).toBeDefined();
    });
  });

  describe('Task 3: iOS Universal Links (apple-app-site-association)', () => {
    it('validates Apple App Site Association format and bundle identifier matching', () => {
      const aasaPath = path.resolve(process.cwd(), 'public/.well-known/apple-app-site-association');
      expect(fs.existsSync(aasaPath)).toBe(true);

      const content = JSON.parse(fs.readFileSync(aasaPath, 'utf8'));
      expect(content.applinks).toBeDefined();
      expect(content.applinks.details[0].appID).toContain(mobileConfig.appId);
      expect(content.applinks.details[0].paths).toContain('/apps/*');
      expect(content.applinks.details[0].paths).toContain('NOT /admin/*');
    });
  });

  describe('Task 1 & 8: Deep Link Route Whitelist & Security Invariants', () => {
    it('allows public routes to be deep-linked', () => {
      expect(nativeBridge.isDeepLinkAllowed('/apps')).toBe(true);
      expect(nativeBridge.isDeepLinkAllowed('/apps/terminal-pro')).toBe(true);
      expect(nativeBridge.isDeepLinkAllowed('/blog')).toBe(true);
      expect(nativeBridge.isDeepLinkAllowed('/blog/architecture-update')).toBe(true);
      expect(nativeBridge.isDeepLinkAllowed('/help')).toBe(true);
      expect(nativeBridge.isDeepLinkAllowed('/help/troubleshooting/errors')).toBe(true);
      expect(nativeBridge.isDeepLinkAllowed('/about')).toBe(true);
      expect(nativeBridge.isDeepLinkAllowed('/search')).toBe(true);
      expect(nativeBridge.isDeepLinkAllowed('/')).toBe(true);
    });

    it('strictly denies private, sensitive, or administrative routes from external deep links', () => {
      expect(nativeBridge.isDeepLinkAllowed('/admin')).toBe(false);
      expect(nativeBridge.isDeepLinkAllowed('/admin/apps')).toBe(false);
      expect(nativeBridge.isDeepLinkAllowed('/settings')).toBe(false);
      expect(nativeBridge.isDeepLinkAllowed('/support/tickets')).toBe(false);
      expect(nativeBridge.isDeepLinkAllowed('/support/tickets/ticket-123')).toBe(false);
      expect(nativeBridge.isDeepLinkAllowed('/library')).toBe(false);
      expect(nativeBridge.isDeepLinkAllowed('/login')).toBe(false);
      expect(nativeBridge.isDeepLinkAllowed('/signup')).toBe(false);
      expect(nativeBridge.isDeepLinkAllowed('/forgot-password')).toBe(false);
    });

    it('rejects external deep links targeting excluded administrative paths', () => {
      expect(nativeBridge.parseDeepLink('elsesourav://admin/apps')).toBeNull();
      expect(nativeBridge.parseDeepLink('elsesourav://settings')).toBeNull();
      expect(nativeBridge.parseDeepLink('elsesourav://support/tickets/123')).toBeNull();
      expect(nativeBridge.parseDeepLink('https://elsesourav.com/admin')).toBeNull();
    });

    it('parses valid public deep links correctly', () => {
      expect(nativeBridge.parseDeepLink('elsesourav://apps/terminal-pro')).toBe('/apps/terminal-pro');
      expect(nativeBridge.parseDeepLink('https://elsesourav.com/blog/article-1')).toBe('/blog/article-1');
      expect(nativeBridge.parseDeepLink('https://elsesourav.com/help/guides/getting-started')).toBe('/help/guides/getting-started');
    });

    it('rejects malicious or third-party deep link targets', () => {
      expect(nativeBridge.parseDeepLink('https://malicious-site.com/steal-creds')).toBeNull();
      expect(nativeBridge.parseDeepLink('elsesourav://javascript:alert(1)')).toBeNull();
      expect(nativeBridge.parseDeepLink('elsesourav://data:text/html,<script>')).toBeNull();
    });

    it('executes navigation callback on valid public deep links', () => {
      const navigateMock = vi.fn();
      const handled = nativeBridge.handleDeepLink('elsesourav://apps/code-editor', navigateMock);

      expect(handled).toBe(true);
      expect(navigateMock).toHaveBeenCalledWith('/apps/code-editor');
    });
  });
});
