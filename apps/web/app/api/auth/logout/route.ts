import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createAuthServerClient } from '@elsesourav/auth';

async function handleSignOut(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const wantsJson =
    request.headers.get('accept')?.includes('application/json') ||
    request.headers.get('content-type')?.includes('application/json');

  const redirectUrl = new URL('/login', requestUrl.origin);
  const response = wantsJson
    ? NextResponse.json({ success: true, redirect: '/login' })
    : NextResponse.redirect(redirectUrl, {
        status: 303, // See Other (standard for POST redirect to GET)
      });

  const cookieStore = await cookies();
  const supabase = createAuthServerClient({
    getAll() {
      return cookieStore.getAll();
    },
    setAll(cookiesToSet) {
      cookiesToSet.forEach(({ name, value, options }) => {
        try {
          cookieStore.set(name, value, options);
        } catch {
          // Handled in Route Handler
        }
        response.cookies.set(name, value, options);
      });
    },
  });

  try {
    await supabase.auth.signOut();
  } catch (error) {
    console.error('[Logout Route] Supabase signOut error:', error);
  }

  // Explicitly wipe all supabase authentication cookies from response headers
  const allCookies = cookieStore.getAll();
  for (const cookie of allCookies) {
    if (
      cookie.name.startsWith('sb-') ||
      cookie.name.includes('auth-token') ||
      cookie.name.includes('supabase')
    ) {
      try {
        cookieStore.delete(cookie.name);
      } catch {
        // Handled in Route Handler
      }
      response.cookies.delete(cookie.name);
      response.cookies.set(cookie.name, '', {
        path: '/',
        maxAge: 0,
        expires: new Date(0),
        sameSite: 'lax',
      });
    }
  }

  return response;
}

export async function POST(request: NextRequest) {
  return handleSignOut(request);
}

export async function GET(request: NextRequest) {
  return handleSignOut(request);
}
