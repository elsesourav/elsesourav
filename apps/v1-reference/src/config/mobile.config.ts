import { appConfig } from './app.config';

/**
 * Mobile Distribution Configuration
 * Reverse-domain identifiers, build versioning, deep linking, and permission lockdown
 * for Google Play (Android) and Apple App Store (iOS).
 */
export interface MobileDistributionConfig {
  readonly appId: string;
  readonly appName: string;
  readonly version: string;
  readonly buildNumber: number;
  readonly webDir: string;
  readonly server: {
    readonly androidScheme: string;
    readonly iosScheme: string;
    readonly hostname: string;
  };
  readonly deepLinks: {
    readonly customScheme: string;
    readonly universalDomains: readonly string[];
  };
  readonly permissions: {
    readonly camera: boolean;
    readonly microphone: boolean;
    readonly location: boolean;
    readonly contacts: boolean;
    readonly photos: boolean;
    readonly bluetooth: boolean;
  };
}

export const mobileConfig: MobileDistributionConfig = {
  // Stable reverse-domain application ID for Google Play & Apple App Store
  appId: 'com.elsesourav.app',
  appName: 'ElseSourav',
  version: appConfig.version,
  buildNumber: 1,
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    iosScheme: 'https',
    hostname: 'elsesourav.com',
  },
  deepLinks: {
    customScheme: 'elsesourav',
    universalDomains: ['elsesourav.com', 'www.elsesourav.com'],
  },
  // Strict permission lockdown - zero unnecessary device access
  permissions: {
    camera: false,
    microphone: false,
    location: false,
    contacts: false,
    photos: false,
    bluetooth: false,
  },
};
