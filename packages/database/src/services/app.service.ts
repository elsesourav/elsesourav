import { AppRepository } from '../repositories/app.repository';
import { AppError } from '@elsesourav/types';
import { PublishStatus } from '@prisma/client';
import type {
  App,
  UserRole,
  CreateAppInput,
  UpdateAppInput,
  AppQueryOptions,
  CategorySummary,
  TagSummary,
} from '@elsesourav/types';

export class AppService {
  constructor(private readonly appRepo: AppRepository) {}

  private requireAdminOrStaff(role?: UserRole): void {
    if (!role || (role !== 'ADMIN' && role !== 'STAFF')) {
      throw AppError.forbidden('Administrative privileges are required to manage applications');
    }
  }

  async getAppBySlug(slug: string, callerRole?: UserRole): Promise<App> {
    const normalizedSlug = slug.trim().toLowerCase();
    const app = await this.appRepo.findBySlug(normalizedSlug);

    if (!app || app.deletedAt) {
      throw AppError.notFound(`Application '${slug}'`);
    }

    // Public / unauthenticated or regular users can only see PUBLISHED applications
    const isPrivileged = callerRole === 'ADMIN' || callerRole === 'STAFF';
    if (!isPrivileged && app.status !== 'published') {
      throw AppError.notFound(`Application '${slug}'`);
    }

    return app;
  }

  async getAdminAppById(callerRole: UserRole, id: string): Promise<App> {
    this.requireAdminOrStaff(callerRole);
    const app = await this.appRepo.findById(id);
    if (!app || app.deletedAt) {
      throw AppError.notFound(`Application '${id}'`);
    }
    return app;
  }

  async listPublishedApps(options: AppQueryOptions = {}): Promise<App[]> {
    return this.appRepo.list({
      ...options,
      status: 'published',
    });
  }

  async listAdminApps(callerRole: UserRole, options: AppQueryOptions = {}): Promise<App[]> {
    this.requireAdminOrStaff(callerRole);
    return this.appRepo.list(options);
  }

  async listCategories(): Promise<CategorySummary[]> {
    return this.appRepo.listPublicCategories();
  }

  async listTags(): Promise<TagSummary[]> {
    return this.appRepo.listPublicTags();
  }

  async createApp(callerRole: UserRole, input: CreateAppInput): Promise<App> {
    this.requireAdminOrStaff(callerRole);

    const slug = input.slug.trim().toLowerCase();
    if (!/^[a-z0-9-]+$/.test(slug)) {
      throw AppError.validation('Slug can only contain lowercase letters, numbers, and hyphens');
    }

    if (!input.name || input.name.trim().length < 2) {
      throw AppError.validation('Application name must be at least 2 characters long');
    }

    if (!input.iconUrl) {
      throw AppError.validation('An application icon URL is required');
    }

    return this.appRepo.create({
      ...input,
      slug,
    });
  }

  async updateApp(callerRole: UserRole, id: string, input: UpdateAppInput): Promise<App> {
    this.requireAdminOrStaff(callerRole);

    if (input.slug) {
      const slug = input.slug.trim().toLowerCase();
      if (!/^[a-z0-9-]+$/.test(slug)) {
        throw AppError.validation('Slug can only contain lowercase letters, numbers, and hyphens');
      }
    }

    return this.appRepo.update(id, input);
  }

  async publishApp(
    callerRole: UserRole,
    appId: string,
    versionData: { version: string; changelog: string; downloadUrl?: string }
  ): Promise<App> {
    this.requireAdminOrStaff(callerRole);

    const app = await this.appRepo.findById(appId);
    if (!app) {
      throw AppError.notFound('Application');
    }

    // Strict completeness validation before public exposure
    if (!app.name || !app.slug || !app.description || !app.iconUrl || !app.primaryCategory) {
      throw AppError.validation(
        'Cannot publish application: required fields (name, slug, description, iconUrl, category) are missing'
      );
    }

    if (!versionData.version || !versionData.changelog) {
      throw AppError.validation('Release version and changelog are required for publication');
    }

    return this.appRepo.publishWithVersionTransaction(appId, versionData);
  }

  async archiveApp(callerRole: UserRole, appId: string): Promise<App> {
    this.requireAdminOrStaff(callerRole);

    const app = await this.appRepo.findById(appId);
    if (!app) {
      throw AppError.notFound('Application');
    }

    return this.appRepo.updateStatus(appId, PublishStatus.ARCHIVED);
  }

  async deleteApp(callerRole: UserRole, appId: string): Promise<void> {
    this.requireAdminOrStaff(callerRole);

    const app = await this.appRepo.findById(appId);
    if (!app) {
      throw AppError.notFound('Application');
    }

    return this.appRepo.softDelete(appId);
  }
}
