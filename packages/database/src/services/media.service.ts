import { MediaRepository } from '../repositories/media.repository';
import { deleteCloudinaryAsset } from '@elsesourav/media';
import { AppError } from '@elsesourav/types';
import type {
  AdminMediaListResult,
  AdminMediaReference,
  UserRole,
} from '@elsesourav/types';

export class MediaService {
  constructor(private readonly mediaRepo: MediaRepository) {}

  private verifyAdmin(callerRole?: UserRole | string): void {
    if (callerRole !== 'ADMIN' && callerRole !== 'STAFF') {
      throw AppError.forbidden('Administrative privileges are required for media management.');
    }
  }

  private verifySuperAdmin(callerRole?: UserRole | string): void {
    if (callerRole !== 'ADMIN') {
      throw AppError.forbidden('Super Administrator privileges are required for destructive media deletion.');
    }
  }

  /**
   * Retrieves paginated media library items with reference inspection
   */
  async listMediaAdmin(
    callerRole: UserRole,
    options: {
      domain?: string;
      status?: string;
      search?: string;
      page?: number;
      limit?: number;
    } = {}
  ): Promise<AdminMediaListResult> {
    this.verifyAdmin(callerRole);

    const limit = Math.min(Math.max(options.limit ?? 24, 1), 100);
    const { items, total, totalReferenced, totalOrphans } =
      await this.mediaRepo.listAdminMedia({
        ...options,
        limit,
      });

    const totalPages = Math.ceil(total / limit) || 1;
    const page = Math.max(options.page ?? 1, 1);

    return {
      items,
      total,
      page,
      limit,
      totalPages,
      totalReferenced,
      totalOrphans,
    };
  }

  /**
   * Checks whether a media asset is actively referenced by any application resources
   */
  async checkMediaUsage(
    callerRole: UserRole,
    publicId: string
  ): Promise<AdminMediaReference[]> {
    this.verifyAdmin(callerRole);
    return this.mediaRepo.checkAssetReferences(publicId);
  }

  /**
   * Safely deletes a Cloudinary asset after verifying reference integrity
   */
  async deleteMediaAdmin(
    callerUserId: string,
    callerRole: UserRole,
    publicId: string,
    force = false
  ): Promise<{ success: boolean; referencesCount: number }> {
    this.verifySuperAdmin(callerRole);

    if (!publicId || typeof publicId !== 'string') {
      throw AppError.validation('A valid publicId is required for deletion');
    }

    // Step 1: Inspect application references
    const references = await this.mediaRepo.checkAssetReferences(publicId);

    if (references.length > 0 && !force) {
      const names = references.map((r) => `${r.resourceType} "${r.resourceName}"`).join(', ');
      throw AppError.validation(
        `Cannot safely delete media asset because it is actively referenced by: ${names}. Remove references or specify force deletion.`
      );
    }

    // Step 2: Delete from Cloudinary storage
    const deleted = await deleteCloudinaryAsset({ publicId });

    // Step 3: Record audit log
    await this.mediaRepo.logMediaAudit(callerUserId, 'MEDIA_ASSET_DELETED', publicId, {
      referencesCount: references.length,
      force,
      deleted,
    });

    return {
      success: true,
      referencesCount: references.length,
    };
  }
}
