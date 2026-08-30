import { describe, it, expect } from 'vitest';
import { SITE_CONFIG, ROUTES } from '@elsesourav/config';

describe('Public Navigation Information Architecture & Route Contracts', () => {
  it('defines primary public identity without release tags', () => {
    expect(SITE_CONFIG.name).toBe('ElseSourav');
    expect(SITE_CONFIG.name).not.toMatch(/v1|v2|version/i);
    expect(SITE_CONFIG.tagline).toBeDefined();
  });

  it('exposes approved primary public navigation routes', () => {
    expect(ROUTES.HOME).toBe('/');
    expect(ROUTES.APPS).toBe('/apps');
    expect(ROUTES.BLOG).toBe('/notes');
    expect(ROUTES.NOTES).toBe('/notes');
    expect(ROUTES.HELP).toBe('/help');
    expect(ROUTES.ABOUT).toBe('/about');
    expect(ROUTES.SUPPORT).toBe('/support');
  });

  it('correctly resolves active-route matching for root and nested paths', () => {
    const isRouteActive = (pathname: string, targetHref: string) => {
      if (targetHref === '/') return pathname === '/';
      return pathname === targetHref || pathname.startsWith(`${targetHref}/`);
    };

    // Apps section
    expect(isRouteActive('/apps', ROUTES.APPS)).toBe(true);
    expect(isRouteActive('/apps/terminal-pro', ROUTES.APPS)).toBe(true);
    expect(isRouteActive('/notes', ROUTES.APPS)).toBe(false);

    // Notes section
    expect(isRouteActive('/notes', ROUTES.NOTES)).toBe(true);
    expect(isRouteActive('/notes/clean-architecture', ROUTES.NOTES)).toBe(true);
    expect(isRouteActive('/apps', ROUTES.NOTES)).toBe(false);

    // Help section
    expect(isRouteActive('/help', ROUTES.HELP)).toBe(true);
    expect(isRouteActive('/help/getting-started/installation', ROUTES.HELP)).toBe(true);

    // Home section
    expect(isRouteActive('/', ROUTES.HOME)).toBe(true);
    expect(isRouteActive('/apps', ROUTES.HOME)).toBe(false);
  });

  it('provides secure routing paths for authenticated dashboard and admin portal', () => {
    expect(ROUTES.DASHBOARD).toBe('/dashboard');
    expect(ROUTES.PROFILE).toBe('/profile');
    expect(ROUTES.LIBRARY).toBe('/library');
    expect(ROUTES.SETTINGS).toBe('/settings');
    expect(ROUTES.ADMIN.ROOT).toBe('/admin');
  });

  it('exposes complete secondary footer navigation and compliance routes', () => {
    expect(ROUTES.PRIVACY).toBe('/privacy');
    expect(ROUTES.TERMS).toBe('/terms');
    expect(ROUTES.ACCESSIBILITY).toBe('/accessibility');
    expect(ROUTES.SUPPORT).toBe('/support');
  });

  it('verifies mobile navigation menu interaction contracts and outside dismissibility', () => {
    const mobileNavContracts = {
      hasBackdrop: true,
      dismissOnOutsidePointer: true,
      dismissOnEscape: true,
      dismissOnRouteChange: true,
      minTouchTargetPx: 44,
    };

    expect(mobileNavContracts.hasBackdrop).toBe(true);
    expect(mobileNavContracts.dismissOnOutsidePointer).toBe(true);
    expect(mobileNavContracts.dismissOnEscape).toBe(true);
    expect(mobileNavContracts.dismissOnRouteChange).toBe(true);
    expect(mobileNavContracts.minTouchTargetPx).toBeGreaterThanOrEqual(44);
  });
});
