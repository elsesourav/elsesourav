import { NextRequest, NextResponse } from 'next/server';
import { SiteService } from '@elsesourav/database';

export const dynamic = 'force-dynamic';

/**
 * Dynamic Favicon Redirect Route
 * Automatically redirects to the active site logo / favicon configured in Admin settings.
 */
export async function GET(request: NextRequest) {
  try {
    const siteService = new SiteService();
    const identity = await siteService.getSiteAndCreatorIdentity();
    const logoUrl = identity.site.logoUrl;

    if (logoUrl) {
      return NextResponse.redirect(new URL(logoUrl, request.url), 302);
    }
  } catch {
    // Fall back to static favicon
  }

  return NextResponse.redirect(new URL('/favicon.ico', request.url), 302);
}
