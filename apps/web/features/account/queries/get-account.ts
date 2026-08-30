import { UserRepository, UserService } from '@elsesourav/database';
import { getServerSession } from '@elsesourav/auth';
import { cookies } from 'next/headers';
import type { User } from '@elsesourav/types';

const userRepo = new UserRepository();
const userService = new UserService(userRepo);

export async function getUserAccountData(): Promise<(User & { provider?: 'email' | 'google' | 'github' }) | null> {
  const cookieStore = await cookies();
  const session = await getServerSession({
    getAll: () => cookieStore.getAll(),
  });

  if (!session?.user?.id) return null;

  try {
    const user = await userService.getUserById(session.user.id);
    if (!user) return null;
    return {
      ...user,
      provider: session.user.provider || 'email',
    };
  } catch {
    return null;
  }
}

