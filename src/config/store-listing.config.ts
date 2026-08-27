import { appConfig } from './app.config';
import { mobileConfig } from './mobile.config';

/**
 * App Store & Google Play Store Submission Configuration
 * Single source of truth for store listings, descriptions, categories,
 * data safety disclosures, and submission compliance checklists.
 */
export interface StoreListingConfig {
  readonly appName: string;
  readonly shortName: string;
  readonly subtitle: string; // Apple App Store subtitle (max 30 chars)
  readonly shortDescription: string; // Google Play short description (max 80 chars)
  readonly fullDescription: string;
  readonly packageId: string;
  readonly bundleId: string;
  readonly version: string;
  readonly buildNumber: number;
  readonly categories: {
    readonly googlePlay: {
      readonly primary: string;
      readonly secondary: string;
    };
    readonly appleAppStore: {
      readonly primary: string;
      readonly secondary: string;
    };
  };
  readonly keywords: readonly string[];
  readonly urls: {
    readonly marketing: string;
    readonly privacyPolicy: string;
    readonly termsOfService: string;
    readonly support: string;
    readonly accountDeletion: string;
  };
  readonly dataSafety: {
    readonly accountData: {
      readonly collected: boolean;
      readonly dataTypes: readonly string[];
      readonly purpose: string;
    };
    readonly userContent: {
      readonly collected: boolean;
      readonly dataTypes: readonly string[];
      readonly purpose: string;
    };
    readonly diagnostics: {
      readonly collected: boolean;
      readonly dataTypes: readonly string[];
      readonly purpose: string;
    };
    readonly thirdPartySharing: boolean;
  };
}

export const storeListingConfig: StoreListingConfig = {
  appName: 'ElseSourav',
  shortName: 'ElseSourav',
  subtitle: 'Developer & Software Platform', // 29 characters (limit: 30)
  shortDescription:
    'Discover apps, tools, and devlogs created by independent developer Sourav.', // 74 characters (limit: 80)
  fullDescription: `Welcome to ElseSourav — the official software showcase and developer platform by independent software engineer Sourav.

Explore a curated catalog of high-performance desktop utilities, mobile applications, web extensions, and open-source developer tools.

KEY FEATURES:
• Software Directory: Discover apps with version history, release notes, screenshots, and direct download links.
• Personal Library: Bookmark favorite applications and organize your software collection (requires optional account).
• Engineering Devlogs: Read deep technical articles, architectural breakdowns, and release devlogs.
• Help & Documentation: Access comprehensive guides, tutorials, and troubleshooting knowledge base.
• Direct Support: Submit and track customer support tickets directly with the developer.
• Modern Glassmorphic Design: Sleek, high-contrast dark and light themes optimized for mobile and desktop.

ACCOUNT REQUIREMENT:
Browsing public applications, reading devlogs, and accessing documentation requires no login or registration. Creating an account is optional and only required to save apps to your personal library and manage support tickets.

PRIVACY & SAFETY:
ElseSourav is committed to user privacy. We do not sell data to third parties or embed advertising trackers.`,
  packageId: mobileConfig.appId,
  bundleId: mobileConfig.appId,
  version: appConfig.version,
  buildNumber: mobileConfig.buildNumber,
  categories: {
    googlePlay: {
      primary: 'Tools',
      secondary: 'Productivity',
    },
    appleAppStore: {
      primary: 'Developer Tools',
      secondary: 'Utilities',
    },
  },
  keywords: [
    'developer tools',
    'software showcase',
    'apps catalog',
    'devlogs',
    'utility applications',
    'indie developer',
    'engineering articles',
    'open source',
  ],
  urls: {
    marketing: 'https://elsesourav.com',
    privacyPolicy: 'https://elsesourav.com/privacy',
    termsOfService: 'https://elsesourav.com/terms',
    support: 'https://elsesourav.com/support',
    accountDeletion: 'https://elsesourav.com/settings',
  },
  dataSafety: {
    accountData: {
      collected: true,
      dataTypes: ['Email Address', 'Display Name', 'User ID'],
      purpose: 'App functionality and account authentication',
    },
    userContent: {
      collected: true,
      dataTypes: ['Saved Library Bookmarks', 'Support Ticket Messages'],
      purpose: 'App functionality and direct customer support',
    },
    diagnostics: {
      collected: true,
      dataTypes: ['Sanitized Error Logs', 'Performance Latency Metrics'],
      purpose: 'App diagnostics, performance monitoring, and bug fixing',
    },
    thirdPartySharing: false,
  },
};
