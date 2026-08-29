import { AppRepository, AppService } from '@elsesourav/database';
import { requireAdmin } from '../../guards/require-admin';
import type { App, CategorySummary, TagSummary, AppQueryOptions } from '@elsesourav/types';

const appRepo = new AppRepository();
const appService = new AppService(appRepo);

export interface AdminAppsListData {
  apps: App[];
  categories: CategorySummary[];
  tags: TagSummary[];
}

export async function getAdminAppsList(options: AppQueryOptions = {}): Promise<AdminAppsListData> {
  const context = await requireAdmin();

  const [apps, categories, tags] = await Promise.all([
    appService.listAdminApps(context.role, options),
    appService.listCategories(),
    appService.listTags(),
  ]);

  return {
    apps,
    categories,
    tags,
  };
}

export interface AdminAppEditData {
  app: App;
  categories: CategorySummary[];
  tags: TagSummary[];
}

export async function getAdminAppForEdit(appId: string): Promise<AdminAppEditData> {
  const context = await requireAdmin();

  const [app, categories, tags] = await Promise.all([
    appService.getAdminAppById(context.role, appId),
    appService.listCategories(),
    appService.listTags(),
  ]);

  return {
    app,
    categories,
    tags,
  };
}
