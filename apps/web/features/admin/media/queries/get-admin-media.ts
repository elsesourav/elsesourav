import { MediaRepository, MediaService } from '@elsesourav/database';
import { requireAdmin } from '../../guards/require-admin';
import type { AdminMediaListResult } from '@elsesourav/types';

const mediaRepo = new MediaRepository();
const mediaService = new MediaService(mediaRepo);

export async function getAdminMediaList(options: {
  domain?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
} = {}): Promise<AdminMediaListResult> {
  const context = await requireAdmin();
  return mediaService.listMediaAdmin(context.role, options);
}
