import type { AppVersion } from '@/types/version.types';
import type { Result } from '@/types/result.types';
import type { AppError } from '@/lib/errors';
import type { PaginatedResult, QueryOptions } from '@/repositories/types';
import {
  appVersionRepository,
  type IAppVersionRepository,
  type CreateAppVersionDto,
  type UpdateAppVersionDto,
} from '@/repositories';
import { err } from '@/lib/result';
import { AppError as ErrorFactory } from '@/lib/errors';
import { isValidSemver, normalizeSemver } from '@/utils/semver';

export type { CreateAppVersionDto, UpdateAppVersionDto };

export interface IAppVersionService {
  getVersion(appId: string, versionId: string): Promise<Result<AppVersion | null, AppError>>;
  getVersionByNumber(appId: string, version: string): Promise<Result<AppVersion | null, AppError>>;
  listVersions(
    appId: string,
    options?: QueryOptions
  ): Promise<Result<PaginatedResult<AppVersion>, AppError>>;
  getLatestVersion(appId: string): Promise<Result<AppVersion | null, AppError>>;
  createVersion(appId: string, data: CreateAppVersionDto): Promise<Result<AppVersion, AppError>>;
  updateVersion(
    appId: string,
    versionId: string,
    data: UpdateAppVersionDto
  ): Promise<Result<AppVersion, AppError>>;
  publishVersion(appId: string, versionId: string): Promise<Result<AppVersion, AppError>>;
  archiveVersion(appId: string, versionId: string): Promise<Result<AppVersion, AppError>>;
  setCurrentVersion(appId: string, versionId: string): Promise<Result<AppVersion, AppError>>;
}

export class AppVersionService implements IAppVersionService {
  constructor(private readonly versionRepo: IAppVersionRepository = appVersionRepository) {}

  public async getVersion(
    appId: string,
    versionId: string
  ): Promise<Result<AppVersion | null, AppError>> {
    return this.versionRepo.findById(appId, versionId);
  }

  public async getVersionByNumber(
    appId: string,
    version: string
  ): Promise<Result<AppVersion | null, AppError>> {
    return this.versionRepo.findByVersion(appId, version);
  }

  public async listVersions(
    appId: string,
    options?: QueryOptions
  ): Promise<Result<PaginatedResult<AppVersion>, AppError>> {
    return this.versionRepo.listByApp(appId, options);
  }

  public async getLatestVersion(appId: string): Promise<Result<AppVersion | null, AppError>> {
    return this.versionRepo.getLatest(appId);
  }

  public async createVersion(
    appId: string,
    data: CreateAppVersionDto
  ): Promise<Result<AppVersion, AppError>> {
    if (!isValidSemver(data.version)) {
      return err(
        ErrorFactory.badRequest(
          `Version "${data.version}" is not a valid Semantic Version (e.g. 1.0.0, 2.1.0-beta.1).`,
          'version'
        )
      );
    }

    const normVersion = normalizeSemver(data.version);
    const isUnique = await this.versionRepo.checkVersionUnique(appId, normVersion);
    if (!isUnique.success) {
      return err(isUnique.error);
    }

    if (!isUnique.data) {
      return err(
        ErrorFactory.badRequest(
          `Version "${normVersion}" already exists for this application.`,
          'version'
        )
      );
    }

    return this.versionRepo.create(appId, {
      ...data,
      appId,
      version: normVersion,
    });
  }

  public async updateVersion(
    appId: string,
    versionId: string,
    data: UpdateAppVersionDto
  ): Promise<Result<AppVersion, AppError>> {
    if (data.version) {
      if (!isValidSemver(data.version)) {
        return err(
          ErrorFactory.badRequest(
            `Version "${data.version}" is not a valid Semantic Version.`,
            'version'
          )
        );
      }

      const normVersion = normalizeSemver(data.version);
      const isUnique = await this.versionRepo.checkVersionUnique(appId, normVersion, versionId);
      if (!isUnique.success) {
        return err(isUnique.error);
      }

      if (!isUnique.data) {
        return err(
          ErrorFactory.badRequest(
            `Version "${normVersion}" already exists for this application.`,
            'version'
          )
        );
      }

      return this.versionRepo.update(appId, versionId, {
        ...data,
        version: normVersion,
      });
    }

    return this.versionRepo.update(appId, versionId, data);
  }

  public async publishVersion(
    appId: string,
    versionId: string
  ): Promise<Result<AppVersion, AppError>> {
    return this.versionRepo.update(appId, versionId, {
      status: 'published',
    });
  }

  public async archiveVersion(
    appId: string,
    versionId: string
  ): Promise<Result<AppVersion, AppError>> {
    return this.versionRepo.update(appId, versionId, {
      status: 'archived',
    });
  }

  public async setCurrentVersion(
    appId: string,
    versionId: string
  ): Promise<Result<AppVersion, AppError>> {
    return this.versionRepo.setCurrentVersion(appId, versionId);
  }
}

export const appVersionService = new AppVersionService();
