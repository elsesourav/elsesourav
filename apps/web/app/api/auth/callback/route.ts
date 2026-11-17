import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createAuthServerClient, sanitizeRedirectUrl } from '@elsesourav/auth';
import { UserRepository } from '@elsesourav/database';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next');
  const errorParam = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');
  const safeRedirectPath = sanitizeRedirectUrl(next, '/');

  // Compute canonical public origin from proxy headers or environment, preventing localhost fallback
  const forwardedHost = request.headers.get('x-forwarded-host');
  const forwardedProto = request.headers.get('x-forwarded-proto') || 'https';
  const canonicalOrigin = forwardedHost
    ? `${forwardedProto}://${forwardedHost}`
    : (process.env.NEXT_PUBLIC_SITE_URL || requestUrl.origin);

  // Handle provider-level error callback (e.g., user canceled consent or provider rejected)
  if (errorParam) {
    const message = errorDescription || errorParam;
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(message)}`, canonicalOrigin)
    );
  }

  if (code) {
    const cookieStore = await cookies();
    const supabase = createAuthServerClient({
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // The `setAll` method was called from a Server Component / Route Handler
        }
      },
    });

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data?.user) {
      // Synchronize OAuth profile to database immediately
      try {
        const metadata = data.user.user_metadata || {};
        const email = data.user.email;
        const displayName =
          metadata.full_name || metadata.name || metadata.user_name || metadata.preferred_username;
        const rawUsername =
          metadata.user_name || metadata.preferred_username || (email ? email.split('@')[0] : undefined);
        const username = rawUsername
          ? String(rawUsername).toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 30)
          : undefined;
        const identityPhoto = data.user.identities
          ?.map(
            (id: { identity_data?: Record<string, unknown> }) =>
              id.identity_data?.['avatar_url'] ||
              id.identity_data?.['picture'] ||
              id.identity_data?.['avatarUrl'] ||
              id.identity_data?.['photoUrl']
          )
          .find(Boolean) as string | undefined;

        const photoUrl =
          metadata.avatar_url ||
          metadata.picture ||
          metadata.avatarUrl ||
          metadata.photoUrl ||
          identityPhoto;

        if (email) {
          const userRepo = new UserRepository();
          await userRepo.syncUserAuth({
            supabaseAuthId: data.user.id,
            email: email.trim().toLowerCase(),
            displayName: displayName ? String(displayName).trim() : undefined,
            username: username && username.length >= 3 ? username : undefined,
            photoUrl: photoUrl ? String(photoUrl).trim() : undefined,
          });
        }
      } catch (syncErr) {
        // Non-blocking sync: log and proceed so the user can still access the app
        console.error('Failed to sync OAuth user profile to database:', syncErr);
      }

      const isPopup = requestUrl.searchParams.get('mode') === 'popup';
      if (isPopup) {
        const metadata = data.user.user_metadata || {};
        const displayName =
          metadata.full_name || metadata.name || metadata.user_name || metadata.preferred_username;
        const rawUsername =
          metadata.user_name || metadata.preferred_username || (data.user.email ? data.user.email.split('@')[0] : 'player');
        const username = String(rawUsername).toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 30);
        const photoUrl = metadata.avatar_url || metadata.picture || metadata.photoUrl;

        const html = `<!DOCTYPE html>
<html>
<head><title>Authentication Complete</title></head>
<body style="background:#070b1e;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;">
  <div style="text-align:center;">
    <h3 style="color:#00f7ff;">Authenticated Successfully</h3>
    <p style="color:#94a3b8;font-size:12px;">Returning to application...</p>
  </div>
  <script>
    try {
      if (window.opener) {
        window.opener.postMessage({
          type: 'ELSESOURAV_AUTH_SUCCESS',
          payload: {
            id: ${JSON.stringify(data.user.id)},
            fullName: ${JSON.stringify(displayName || 'Player')},
            username: ${JSON.stringify(username || 'player')},
            email: ${JSON.stringify(data.user.email || '')},
            avatarUrl: ${JSON.stringify(photoUrl || '')},
            token: ${JSON.stringify(data.session?.access_token || '')}
          }
        }, '*');
        setTimeout(() => window.close(), 300);
      } else {
        window.location.href = ${JSON.stringify(safeRedirectPath)};
      }
    } catch (e) {
      window.location.href = ${JSON.stringify(safeRedirectPath)};
    }
  </script>
</body>
</html>`;
        return new NextResponse(html, {
          status: 200,
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
        });
      }

      if (safeRedirectPath.startsWith('http://') || safeRedirectPath.startsWith('https://')) {
        const dest = new URL(safeRedirectPath);
        if (data.session?.access_token) {
          dest.hash = `access_token=${data.session.access_token}&refresh_token=${data.session.refresh_token}&token_type=bearer`;
        }
        return NextResponse.redirect(dest);
      }

      return NextResponse.redirect(new URL(safeRedirectPath, canonicalOrigin));
    }

    if (error) {
      console.error('OAuth exchange error:', error.message);
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(error.message)}`, canonicalOrigin)
      );
    }
  }

  return NextResponse.redirect(new URL('/login?error=oauth_exchange_failed', canonicalOrigin));
}
