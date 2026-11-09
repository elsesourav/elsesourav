import { createAuthServerClient, CookieMethodsServer } from './server-client';
import { AppError } from '@elsesourav/types';
import type { AuthenticatedUser, AuthSession } from '../types/auth.types';
import type { UserRole } from '@elsesourav/types';

function getDevFallbackSession(): AuthSession | null {
  // SECURITY: Never allow auth bypass in production, even if the env var is accidentally set
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  if (process.env['DEV_AUTH_BYPASS'] === 'true') {
    const devUser: AuthenticatedUser = {
      id: 'fce86899-0da4-452d-85e3-7ec74bca0dc9',
      supabaseAuthId: 'fce86899-0da4-452d-85e3-7ec74bca0dc9',
      email: 'souravbarui8040@gmail.com',
      displayName: 'Sourav Barui',
      photoUrl: '/avatars/avatar-1.svg',
      role: 'ADMIN',
      isEmailVerified: true,
      provider: 'email',
      createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
    };
    return {
      accessToken: 'dev-mock-access-token',
      user: devUser,
    };
  }
  return null;
}

export async function getServerSession(
  cookieStore: CookieMethodsServer,
  supabaseUrl?: string,
  supabaseAnonKey?: string
): Promise<AuthSession | null> {
  try {
    const supabase = createAuthServerClient(cookieStore, supabaseUrl, supabaseAnonKey);
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return getDevFallbackSession();
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();

    const validRoles: UserRole[] = ['USER', 'ADMIN', 'STAFF'];
    const rawRole = (user.app_metadata?.['role'] || user.user_metadata?.['role']) as
      UserRole | undefined;
    const adminEmail = (
      process.env['ADMIN_EMAIL'] ||
      process.env['NEXT_PUBLIC_ADMIN_EMAIL'] ||
      'elsesourav.auth@gmail.com'
    )
      .trim()
      .toLowerCase();
    const isDesignatedAdmin = Boolean(user.email && user.email.trim().toLowerCase() === adminEmail);
    const role: UserRole = isDesignatedAdmin
      ? 'ADMIN'
      : rawRole && validRoles.includes(rawRole)
        ? rawRole
        : 'USER';

    const identityPhoto = user.identities
      ?.map(
        (id) =>
          (id.identity_data?.['avatar_url'] ||
            id.identity_data?.['picture'] ||
            id.identity_data?.['avatarUrl'] ||
            id.identity_data?.['photoUrl']) as string | undefined
      )
      .find(Boolean);

    const rawPhotoUrl =
      (user.user_metadata?.['avatar_url'] as string | undefined) ||
      (user.user_metadata?.['picture'] as string | undefined) ||
      (user.user_metadata?.['avatarUrl'] as string | undefined) ||
      (user.user_metadata?.['photoUrl'] as string | undefined) ||
      identityPhoto ||
      undefined;

    const detectedProvider =
      (user.app_metadata?.['provider'] as 'email' | 'google' | 'github' | undefined) ||
      (user.identities?.[0]?.provider as 'email' | 'google' | 'github' | undefined) ||
      'email';

    const authenticatedUser: AuthenticatedUser = {
      id: user.id,
      supabaseAuthId: user.id,
      email: user.email || '',
      displayName:
        user.user_metadata?.['full_name'] ||
        user.user_metadata?.['name'] ||
        user.email?.split('@')[0] ||
        'User',
      photoUrl: rawPhotoUrl ? String(rawPhotoUrl).trim() : undefined,
      role,
      isEmailVerified: Boolean(user.email_confirmed_at),
      provider: detectedProvider,
      createdAt: new Date(user.created_at).getTime(),
    };

    return {
      accessToken: session?.access_token || '',
      refreshToken: session?.refresh_token,
      expiresAt: session?.expires_at ? session.expires_at * 1000 : undefined,
      user: authenticatedUser,
    };
  } catch {
    return getDevFallbackSession();
  }
}

export async function requireAuth(
  cookieStore: CookieMethodsServer,
  supabaseUrl?: string,
  supabaseAnonKey?: string
): Promise<AuthenticatedUser> {
  const session = await getServerSession(cookieStore, supabaseUrl, supabaseAnonKey);
  if (!session) {
    throw AppError.unauthorized('Authentication is required to access this resource');
  }
  return session.user;
}

export async function requireRole(
  cookieStore: CookieMethodsServer,
  allowedRoles: UserRole[],
  supabaseUrl?: string,
  supabaseAnonKey?: string
): Promise<AuthenticatedUser> {
  const user = await requireAuth(cookieStore, supabaseUrl, supabaseAnonKey);
  if (!allowedRoles.includes(user.role)) {
    throw AppError.forbidden('You do not have required permissions to perform this operation');
  }
  return user;
}
