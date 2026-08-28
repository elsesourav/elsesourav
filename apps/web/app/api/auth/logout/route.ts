import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createAuthServerClient } from '@elsesourav/auth';

export async function POST(request: NextRequest) {
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
        // Handled in Route Handler
      }
    },
  });

  await supabase.auth.signOut();

  const requestUrl = new URL(request.url);
  return NextResponse.redirect(new URL('/login', requestUrl.origin), {
    status: 303, // See Other (standard for POST redirect to GET)
  });
}
