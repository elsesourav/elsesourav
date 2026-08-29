import { cookies } from 'next/headers';
import { getServerSession } from '@elsesourav/auth';
import { LibraryRepository, LibraryService } from '@elsesourav/database';
import type { UserLibraryResult } from '@elsesourav/types';

const libraryRepo = new LibraryRepository();
const libraryService = new LibraryService(libraryRepo);

export interface UserLibraryPageData extends UserLibraryResult {
  isAuthenticated: boolean;
  userId?: string;
}

export async function getUserLibraryData(options?: {
  page?: number;
  limit?: number;
}): Promise<UserLibraryPageData> {
  const cookieStore = await cookies();
  const session = await getServerSession(cookieStore);

  if (!session?.user?.id) {
    return {
      items: [],
      totalCount: 0,
      isAuthenticated: false,
    };
  }

  const result = await libraryService.getUserLibrary(session.user.id, options);
  return {
    ...result,
    isAuthenticated: true,
    userId: session.user.id,
  };
}
