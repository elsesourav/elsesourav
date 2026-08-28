import type { App, AppLink, AppPlatform, AppActionType } from '@/types/app.types';
import { isSafeExternalUrl } from './url-safety';

export type SmartActionIconType =
  'external' | 'download' | 'chrome' | 'play' | 'apple' | 'github' | 'arrow' | 'globe';

export interface SmartAction {
  readonly label: string;
  readonly ariaLabel: string;
  readonly iconType: SmartActionIconType;
  readonly url: string | null;
  readonly platform: AppPlatform | 'internal';
  readonly actionType: AppActionType;
  readonly isExternal: boolean;
  readonly isSafeUrl: boolean;
  readonly target: '_blank' | '_self';
  readonly rel: 'noopener noreferrer' | undefined;
  readonly linkId?: string;
}

/**
 * Resolves the primary smart action for an application based on its platform links.
 */
export function resolveSmartAction(app: App, linkOverride?: AppLink): SmartAction {
  const activeLink =
    linkOverride ||
    app.links.find((l) => l.isPrimary && l.isActive) ||
    app.links.find((l) => l.isActive) ||
    null;

  if (!activeLink) {
    return {
      label: 'View Details',
      ariaLabel: `View details for ${app.name}`,
      iconType: 'arrow',
      url: `/apps/${app.slug}`,
      platform: 'internal',
      actionType: 'visit_website',
      isExternal: false,
      isSafeUrl: true,
      target: '_self',
      rel: undefined,
    };
  }

  const safe = isSafeExternalUrl(activeLink.url);

  // Platform to label & icon mapping
  switch (activeLink.platform) {
    case 'web':
      return {
        label: 'Open App',
        ariaLabel: `Open ${app.name} web application`,
        iconType: 'external',
        url: safe ? activeLink.url : null,
        platform: 'web',
        actionType: activeLink.action || 'open_app',
        isExternal: true,
        isSafeUrl: safe,
        target: '_blank',
        rel: 'noopener noreferrer',
        linkId: activeLink.id,
      };

    case 'chrome':
      return {
        label: 'Add to Chrome',
        ariaLabel: `Add ${app.name} to Google Chrome`,
        iconType: 'chrome',
        url: safe ? activeLink.url : null,
        platform: 'chrome',
        actionType: activeLink.action || 'add_to_chrome',
        isExternal: true,
        isSafeUrl: safe,
        target: '_blank',
        rel: 'noopener noreferrer',
        linkId: activeLink.id,
      };

    case 'android':
      return {
        label: 'Get on Play Store',
        ariaLabel: `Get ${app.name} on Google Play Store`,
        iconType: 'play',
        url: safe ? activeLink.url : null,
        platform: 'android',
        actionType: activeLink.action || 'get_on_play_store',
        isExternal: true,
        isSafeUrl: safe,
        target: '_blank',
        rel: 'noopener noreferrer',
        linkId: activeLink.id,
      };

    case 'ios':
      return {
        label: 'Get on App Store',
        ariaLabel: `Get ${app.name} on Apple App Store`,
        iconType: 'apple',
        url: safe ? activeLink.url : null,
        platform: 'ios',
        actionType: activeLink.action || 'download',
        isExternal: true,
        isSafeUrl: safe,
        target: '_blank',
        rel: 'noopener noreferrer',
        linkId: activeLink.id,
      };

    case 'github':
      return {
        label: 'View on GitHub',
        ariaLabel: `View ${app.name} open source repository on GitHub`,
        iconType: 'github',
        url: safe ? activeLink.url : null,
        platform: 'github',
        actionType: activeLink.action || 'view_on_github',
        isExternal: true,
        isSafeUrl: safe,
        target: '_blank',
        rel: 'noopener noreferrer',
        linkId: activeLink.id,
      };

    case 'windows':
    case 'macos':
    case 'linux':
    case 'download':
      return {
        label: 'Download',
        ariaLabel: `Download ${app.name} for ${activeLink.platform}`,
        iconType: 'download',
        url: safe ? activeLink.url : null,
        platform: activeLink.platform,
        actionType: activeLink.action || 'download',
        isExternal: true,
        isSafeUrl: safe,
        target: '_blank',
        rel: 'noopener noreferrer',
        linkId: activeLink.id,
      };

    default:
      return {
        label: activeLink.label || 'Visit Website',
        ariaLabel: `${activeLink.label || 'Visit Website'} for ${app.name}`,
        iconType: 'external',
        url: safe ? activeLink.url : null,
        platform: activeLink.platform,
        actionType: activeLink.action || 'visit_website',
        isExternal: true,
        isSafeUrl: safe,
        target: '_blank',
        rel: 'noopener noreferrer',
        linkId: activeLink.id,
      };
  }
}
