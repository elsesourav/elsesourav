import { NextRequest, NextResponse } from 'next/server';
import { getBrandLogoVariant } from '@elsesourav/media';

/**
 * Dynamic Media & Logo Variant API Route
 * Handles on-the-fly resolution of brand logos, SVGs, and responsive size variants.
 * Usage: GET /api/media/variant?url=/logo.png&w=64&h=64
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get('url');
  const w = searchParams.get('w');
  const h = searchParams.get('h');
  const f = searchParams.get('f') as 'svg' | 'webp' | 'png' | 'auto' | null;

  if (!targetUrl) {
    return NextResponse.json({ error: 'Missing required "url" parameter' }, { status: 400 });
  }

  const width = w ? parseInt(w, 10) : undefined;
  const height = h ? parseInt(h, 10) : undefined;

  const variantUrl = getBrandLogoVariant(targetUrl, {
    width,
    height,
    format: f || undefined,
  });

  // Redirect to the resolved cloud or local variant
  return NextResponse.redirect(new URL(variantUrl, request.url), 302);
}
