import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { sanitizeRedirectUrl } from '../security/redirect';
import { AuthError } from '../errors/auth-errors';
import type { OAuthSignInOptions } from '../types/auth.types';

export function createAuthBrowserClient(
  supabaseUrl?: string,
  supabaseAnonKey?: string
): SupabaseClient {
  const url = supabaseUrl || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const key = supabaseAnonKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

  return createBrowserClient(url, key);
}

export async function signInWithOAuth(
  client: SupabaseClient,
  options: OAuthSignInOptions
): Promise<{ url: string | null; error: AuthError | null }> {
  try {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://elsesourav.com';
    const safeRedirect = sanitizeRedirectUrl(options.redirectTo, '/');
    const redirectToUrl = `${origin}/api/auth/callback?next=${encodeURIComponent(safeRedirect)}`;

    const { data, error } = await client.auth.signInWithOAuth({
      provider: options.provider,
      options: {
        redirectTo: redirectToUrl,
        scopes: options.scopes,
      },
    });

    if (error) {
      return { url: null, error: AuthError.fromSupabase(error) };
    }

    return { url: data.url, error: null };
  } catch (err) {
    return { url: null, error: new AuthError('Failed to initialize OAuth sign-in', err) };
  }
}
