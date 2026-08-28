import { createServerClient, type CookieOptions } from '@supabase/ssr';

export interface CookieMethodsServer {
  getAll: () => { name: string; value: string }[] | Promise<{ name: string; value: string }[]>;
  setAll?: (cookies: { name: string; value: string; options: CookieOptions }[]) => void;
}

export function createAuthServerClient(
  cookieStore: CookieMethodsServer,
  supabaseUrl?: string,
  supabaseAnonKey?: string
) {
  const url = supabaseUrl || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const key = supabaseAnonKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

  return createServerClient(url, key, {
    cookies: {
      async getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        if (cookieStore.setAll) {
          cookieStore.setAll(cookiesToSet);
        }
      },
    },
  });
}
