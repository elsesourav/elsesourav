import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { sanitizeRedirectUrl } from '../security/redirect';
import { AuthError } from '../errors/auth-errors';
import type { OAuthSignInOptions } from '../types/auth.types';

export function createAuthBrowserClient(
  supabaseUrl?: string,
  supabaseAnonKey?: string
): SupabaseClient {
  const url =
    supabaseUrl || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const key =
    supabaseAnonKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

  return createBrowserClient(url, key);
}

export async function signInWithOAuth(
  client: SupabaseClient,
  options: OAuthSignInOptions
): Promise<{ url: string | null; error: AuthError | null }> {
  try {
    const origin =
      typeof window !== 'undefined' ? window.location.origin : 'https://elsesourav.com';
    const safeRedirect = sanitizeRedirectUrl(options.redirectTo, '/');
    const redirectToUrl = `${origin}/api/auth/callback?next=${encodeURIComponent(safeRedirect)}`;

    const { data, error } = await client.auth.signInWithOAuth({
      provider: options.provider,
      options: {
        redirectTo: redirectToUrl,
        scopes: options.scopes,
        skipBrowserRedirect: true,
      },
    });

    if (error) {
      return { url: null, error: AuthError.fromSupabase(error) };
    }

    if (!data.url) {
      return { url: null, error: new AuthError('No OAuth authorization URL returned') };
    }

    // Pre-flight validation: check if the OAuth provider is enabled in Supabase
    // This prevents kicking the user out to a raw 400 JSON error page if the provider is disabled
    try {
      const probe = await fetch(data.url, { method: 'GET', redirect: 'manual' });
      if (probe.status === 400) {
        const body = (await probe.json().catch(() => null)) as { msg?: string } | null;
        if (body?.msg?.includes('not enabled')) {
          const providerName = options.provider === 'google' ? 'Google' : 'GitHub';
          return {
            url: null,
            error: new AuthError(
              `${providerName} authentication is not enabled in your Supabase project yet. Please enable ${providerName} in Supabase Dashboard > Authentication > Providers, or sign in with your email/username.`,
              { code: 'PROVIDER_DISABLED' }
            ),
          };
        }
      }
    } catch {
      // Network or opaque redirect, safely proceed
    }

    return { url: data.url, error: null };
  } catch (err) {
    return { url: null, error: new AuthError('Failed to initialize OAuth sign-in', err) };
  }
}
