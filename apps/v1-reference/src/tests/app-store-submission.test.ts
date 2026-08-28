import { describe, it, expect } from 'vitest';
import { storeListingConfig } from '@/config/store-listing.config';
import { mobileConfig } from '@/config/mobile.config';
import { appConfig } from '@/config/app.config';
import packageJson from '../../package.json';

describe('App Store & Google Play Store Submission Readiness (Prompt 83)', () => {
  describe('Task 1, 2, 3 & 4: App Identity & Metadata Standards', () => {
    it('synchronizes application identifiers and versioning with package.json', () => {
      expect(storeListingConfig.appName).toBe('ElseSourav');
      expect(storeListingConfig.version).toBe(packageJson.version);
      expect(storeListingConfig.version).toBe(appConfig.version);
      expect(storeListingConfig.packageId).toBe(mobileConfig.appId);
      expect(storeListingConfig.bundleId).toBe(mobileConfig.appId);
      expect(storeListingConfig.buildNumber).toBe(mobileConfig.buildNumber);
    });

    it('enforces Apple App Store character limits for title and subtitle', () => {
      expect(storeListingConfig.appName.length).toBeLessThanOrEqual(30);
      expect(storeListingConfig.subtitle.length).toBeLessThanOrEqual(30);
      expect(storeListingConfig.subtitle.length).toBeGreaterThan(5);
    });

    it('enforces Google Play character limits for short description', () => {
      expect(storeListingConfig.shortDescription.length).toBeLessThanOrEqual(80);
      expect(storeListingConfig.shortDescription.length).toBeGreaterThan(15);
    });

    it('contains comprehensive full description without fraudulent claims', () => {
      expect(storeListingConfig.fullDescription.length).toBeGreaterThan(200);
      expect(storeListingConfig.fullDescription).toContain('Software Directory');
      expect(storeListingConfig.fullDescription).toContain('Personal Library');
      expect(storeListingConfig.fullDescription).toContain('Engineering Devlogs');
    });

    it('defines relevant, non-spammy store keywords', () => {
      expect(storeListingConfig.keywords.length).toBeGreaterThan(3);
      expect(storeListingConfig.keywords).toContain('developer tools');
      expect(storeListingConfig.keywords).toContain('software showcase');
    });
  });

  describe('Task 5 & 9: Categories & Production Store URLs', () => {
    it('specifies valid primary and secondary categories for both stores', () => {
      expect(storeListingConfig.categories.googlePlay.primary).toBe('Tools');
      expect(storeListingConfig.categories.appleAppStore.primary).toBe('Developer Tools');
    });

    it('uses verified production HTTPS endpoints for all compliance URLs', () => {
      const { marketing, privacyPolicy, termsOfService, support, accountDeletion } =
        storeListingConfig.urls;

      expect(marketing).toBe('https://elsesourav.com');
      expect(privacyPolicy).toBe('https://elsesourav.com/privacy');
      expect(termsOfService).toBe('https://elsesourav.com/terms');
      expect(support).toBe('https://elsesourav.com/support');
      expect(accountDeletion).toBe('https://elsesourav.com/settings');
    });
  });

  describe('Task 10 & 11: Account Deletion & Data Safety Disclosures', () => {
    it('discloses transparent data collection categories compliant with Play & App Store policies', () => {
      const { accountData, userContent, diagnostics, thirdPartySharing } =
        storeListingConfig.dataSafety;

      expect(accountData.collected).toBe(true);
      expect(accountData.dataTypes).toContain('Email Address');

      expect(userContent.collected).toBe(true);
      expect(userContent.dataTypes).toContain('Saved Library Bookmarks');

      expect(diagnostics.collected).toBe(true);
      expect(diagnostics.dataTypes).toContain('Sanitized Error Logs');

      expect(thirdPartySharing).toBe(false);
    });
  });
});
