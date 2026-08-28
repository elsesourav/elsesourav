'use server';

import { cookies } from 'next/headers';
import { getServerSession } from '@elsesourav/auth';
import { LibraryRepository, LibraryService } from '@elsesourav/database';
import { revalidatePath } from 'next/cache';

const libraryRepo = new LibraryRepository();
const libraryService = new LibraryService(libraryRepo);

export interface ToggleSaveResult {
  success: boolean;
  isSaved: boolean;
  appId: string;
  error?: string;
}

export async function toggleSaveAppAction(appId: string): Promise<ToggleSaveResult> {
  try {
    const cookieStore = await cookies();
    const session = await getServerSession(cookieStore);

    if (!session?.user?.id) {
      return {
        success: false,
        isSaved: false,
        appId,
        error: 'Authentication required to save apps to your library',
      };
    }

    const userId = session.user.id;
    const isCurrentlySaved = await libraryService.isAppSaved(userId, appId);

    if (isCurrentlySaved) {
      await libraryService.unsaveApp(userId, appId);
      revalidatePath('/library');
      revalidatePath('/apps');
      return {
        success: true,
        isSaved: false,
        appId,
      };
    } else {
      await libraryService.saveApp(userId, { appId });
      revalidatePath('/library');
      revalidatePath('/apps');
      return {
        success: true,
        isSaved: true,
        appId,
      };
    }
  } catch (error) {
    return {
      success: false,
      isSaved: false,
      appId,
      error: error instanceof Error ? error.message : 'Failed to update library',
    };
  }
}

export async function checkAppSavedAction(appId: string): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const session = await getServerSession(cookieStore);
    if (!session?.user?.id) return false;
    return libraryService.isAppSaved(session.user.id, appId);
  } catch {
    return false;
  }
}
