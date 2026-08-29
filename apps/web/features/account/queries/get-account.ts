import { UserRepository, UserService } from '@elsesourav/database';
import { getServerSession } from '@elsesourav/auth';
import { cookies } from 'next/headers';
import type { User } from '@elsesourav/types';

const userRepo = new UserRepository();
const userService = new UserService(userRepo);

export async function getUserAccountData(): Promise<User | null> {
  const cookieStore = await cookies();
  const session = await getServerSession({
    getAll: () => cookieStore.getAll(),
  });

  if (!session?.user?.id) return null;

  try {
    return await userService.getUserById(session.user.id);
  } catch {
    return null;
  }
}
