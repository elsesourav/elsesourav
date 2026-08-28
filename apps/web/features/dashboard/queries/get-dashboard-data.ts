import { cookies } from 'next/headers';
import { getServerSession } from '@elsesourav/auth';
import type { AuthenticatedUser } from '@elsesourav/auth';
import { LibraryRepository, LibraryService, UserRepository, UserService } from '@elsesourav/database';
import type { LibraryItem, User as DomainUser } from '@elsesourav/types';

const libraryRepo = new LibraryRepository();
const libraryService = new LibraryService(libraryRepo);

const userRepo = new UserRepository();
const userService = new UserService(userRepo);

export interface DashboardData {
  user: AuthenticatedUser;
  profile?: DomainUser | null;
  savedAppsCount: number;
  recentSavedApps: readonly LibraryItem[];
}

export async function getDashboardData(): Promise<DashboardData | null> {
  const cookieStore = await cookies();
  const session = await getServerSession({
    getAll: () => cookieStore.getAll(),
  });

  if (!session?.user?.id) {
    return null;
  }

  const userId = session.user.id;

  const [profile, libraryResult] = await Promise.all([
    userService.getUserById(userId).catch(() => null),
    libraryService.getUserLibrary(userId, { limit: 3 }).catch(() => ({ items: [], totalCount: 0 })),
  ]);

  return {
    user: session.user,
    profile,
    savedAppsCount: libraryResult.totalCount,
    recentSavedApps: libraryResult.items,
  };
}
