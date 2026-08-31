import { UserRepository } from '@elsesourav/database';
import { getServerSession } from '@elsesourav/auth';
import { cookies } from 'next/headers';
import type { User } from '@elsesourav/types';

const userRepo = new UserRepository();

export async function getUserAccountData(): Promise<
  (User & { provider?: 'email' | 'google' | 'github' }) | null
> {
  const cookieStore = await cookies();
  const session = await getServerSession({
    getAll: () => cookieStore.getAll(),
  });

  if (!session?.user?.id && !session?.user?.email) {
    return null;
  }

  try {
    let user: User | null = null;
    if (session.user.id) {
      user = await userRepo.findByIdOrAuthId(session.user.id);
    }
    if (!user && session.user.email) {
      user = await userRepo.findByEmail(session.user.email);
    }
    if (!user && session.user.email && session.user.id) {
      user = await userRepo.syncUserAuth({
        supabaseAuthId: session.user.id,
        email: session.user.email,
        displayName: session.user.displayName,
        photoUrl: session.user.photoUrl || undefined,
      });
    }

    if (!user) {
      return {
        id: session.user.id,
        supabaseAuthId: session.user.id,
        email: session.user.email,
        displayName: session.user.displayName || 'ElseSourav Member',
        username: (session.user as unknown as { username?: string }).username || undefined,
        photoUrl: session.user.photoUrl || undefined,
        bio: undefined,
        role: session.user.role || 'USER',
        status: 'active',
        emailVerified: false,
        preferences: {
          theme: 'dark',
          emailNotifications: true,
          reduceMotion: false,
          compactView: false,
        },
        createdAt: session.user.createdAt || Date.now(),
        updatedAt: session.user.createdAt || Date.now(),
        provider: session.user.provider || 'email',
      };
    }

    return {
      ...user,
      provider: session.user.provider || 'email',
    };
  } catch (error) {
    console.error('Failed to get user account data:', error);
    return {
      id: session.user.id,
      supabaseAuthId: session.user.id,
      email: session.user.email,
      displayName: session.user.displayName || 'ElseSourav Member',
      username: (session.user as unknown as { username?: string }).username || undefined,
      photoUrl: session.user.photoUrl || undefined,
      bio: undefined,
      role: session.user.role || 'USER',
      status: 'active',
      emailVerified: false,
      preferences: {
        theme: 'dark',
        emailNotifications: true,
        reduceMotion: false,
        compactView: false,
      },
      createdAt: session.user.createdAt || Date.now(),
      updatedAt: session.user.createdAt || Date.now(),
      provider: session.user.provider || 'email',
    };
  }
}
