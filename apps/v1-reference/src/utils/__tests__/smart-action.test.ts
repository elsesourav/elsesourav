import { describe, it, expect } from 'vitest';
import { resolveSmartAction } from '../smart-action';
import { isSafeExternalUrl } from '../url-safety';
import type { App, AppLink } from '@/types/app.types';

const baseApp: App = {
  id: 'app-test',
  slug: 'test-app',
  name: 'Test Application',
  shortDescription: 'Short description.',
  description: 'Full description.',
  iconUrl: 'https://cdn.elsesourav.com/icon.png',
  primaryCategory: 'utilities',
  tags: ['tool'],
  status: 'published',
  platforms: ['web'],
  links: [],
  screenshots: [],
  stats: { views: 0, launches: 0, libraryAdds: 0 },
  isFeatured: false,
  isPinned: false,
  sortOrder: 0,
  createdAt: 100,
  updatedAt: 100,
};

describe('Smart Action Resolver & Security (smart-action.ts)', () => {
  describe('isSafeExternalUrl URL Security Validation', () => {
    it('accepts valid HTTPS and HTTP URLs', () => {
      expect(isSafeExternalUrl('https://elsesourav.com')).toBe(true);
      expect(isSafeExternalUrl('https://chrome.google.com/webstore/detail/123')).toBe(true);
      expect(isSafeExternalUrl('http://localhost:3000')).toBe(true);
    });

    it('rejects unsafe schemes like javascript:, data:, vbscript:', () => {
      expect(isSafeExternalUrl('javascript:alert(1)')).toBe(false);
      expect(isSafeExternalUrl('data:text/html,<script>alert(1)</script>')).toBe(false);
      expect(isSafeExternalUrl('vbscript:msgbox("hello")')).toBe(false);
      expect(isSafeExternalUrl('file:///etc/passwd')).toBe(false);
      expect(isSafeExternalUrl('')).toBe(false);
      expect(isSafeExternalUrl(null)).toBe(false);
      expect(isSafeExternalUrl(undefined)).toBe(false);
      expect(isSafeExternalUrl('not a url')).toBe(false);
    });
  });

  describe('resolveSmartAction Platform Resolutions', () => {
    it('resolves Web platform to "Open App"', () => {
      const webLink: AppLink = {
        id: 'l1',
        appId: 'app-test',
        platform: 'web',
        label: 'Launch Web App',
        url: 'https://app.elsesourav.com',
        action: 'open_app',
        isPrimary: true,
        displayOrder: 0,
        isActive: true,
      };

      const app = { ...baseApp, links: [webLink] };
      const action = resolveSmartAction(app);

      expect(action.label).toBe('Open App');
      expect(action.iconType).toBe('external');
      expect(action.isExternal).toBe(true);
      expect(action.target).toBe('_blank');
      expect(action.rel).toBe('noopener noreferrer');
      expect(action.isSafeUrl).toBe(true);
    });

    it('resolves Chrome extension platform to "Add to Chrome"', () => {
      const chromeLink: AppLink = {
        id: 'l2',
        appId: 'app-test',
        platform: 'chrome',
        label: 'Chrome Web Store',
        url: 'https://chrome.google.com/webstore/detail/xyz',
        action: 'add_to_chrome',
        isPrimary: true,
        displayOrder: 0,
        isActive: true,
      };

      const app = { ...baseApp, links: [chromeLink] };
      const action = resolveSmartAction(app);

      expect(action.label).toBe('Add to Chrome');
      expect(action.iconType).toBe('chrome');
      expect(action.platform).toBe('chrome');
    });

    it('resolves Android platform to "Get on Play Store"', () => {
      const androidLink: AppLink = {
        id: 'l3',
        appId: 'app-test',
        platform: 'android',
        label: 'Google Play',
        url: 'https://play.google.com/store/apps/details?id=com.test',
        action: 'get_on_play_store',
        isPrimary: true,
        displayOrder: 0,
        isActive: true,
      };

      const app = { ...baseApp, links: [androidLink] };
      const action = resolveSmartAction(app);

      expect(action.label).toBe('Get on Play Store');
      expect(action.iconType).toBe('play');
    });

    it('resolves iOS platform to "Get on App Store"', () => {
      const iosLink: AppLink = {
        id: 'l4',
        appId: 'app-test',
        platform: 'ios',
        label: 'App Store',
        url: 'https://apps.apple.com/app/id12345',
        action: 'download',
        isPrimary: true,
        displayOrder: 0,
        isActive: true,
      };

      const app = { ...baseApp, links: [iosLink] };
      const action = resolveSmartAction(app);

      expect(action.label).toBe('Get on App Store');
      expect(action.iconType).toBe('apple');
    });

    it('resolves GitHub platform to "View on GitHub"', () => {
      const githubLink: AppLink = {
        id: 'l5',
        appId: 'app-test',
        platform: 'github',
        label: 'GitHub Repo',
        url: 'https://github.com/elsesourav/test-app',
        action: 'view_on_github',
        isPrimary: true,
        displayOrder: 0,
        isActive: true,
      };

      const app = { ...baseApp, links: [githubLink] };
      const action = resolveSmartAction(app);

      expect(action.label).toBe('View on GitHub');
      expect(action.iconType).toBe('github');
    });

    it('resolves desktop / download platforms to "Download"', () => {
      const downloadLink: AppLink = {
        id: 'l6',
        appId: 'app-test',
        platform: 'windows',
        label: 'Download Installer',
        url: 'https://cdn.elsesourav.com/install.exe',
        action: 'download',
        isPrimary: true,
        displayOrder: 0,
        isActive: true,
      };

      const app = { ...baseApp, links: [downloadLink] };
      const action = resolveSmartAction(app);

      expect(action.label).toBe('Download');
      expect(action.iconType).toBe('download');
    });

    it('falls back to "View Details" internal link when no active links exist', () => {
      const app = { ...baseApp, links: [] };
      const action = resolveSmartAction(app);

      expect(action.label).toBe('View Details');
      expect(action.url).toBe('/apps/test-app');
      expect(action.isExternal).toBe(false);
      expect(action.target).toBe('_self');
    });
  });
});
