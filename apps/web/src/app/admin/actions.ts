"use server";

import { requireAdminContext } from "@/lib/page-access";
import { fetchServiceData } from "@/lib/service-client";
import type { AuthStats, CatalogStats, UserStats } from "@/lib/view-models";

export async function getAdminCatalogStats(): Promise<CatalogStats> {
  const user = await requireAdminContext();
  return fetchServiceData<CatalogStats>({
    service: "catalog",
    path: "/v1/admin/catalog/stats",
    user,
  }).catch(() => ({
    appsCount: 0,
    categoriesCount: 0,
    recentApps: [],
  }));
}

export async function getAdminAuthStats(): Promise<AuthStats> {
  const user = await requireAdminContext();
  return fetchServiceData<AuthStats>({
    service: "auth",
    path: "/v1/auth/admin/stats",
    user,
  }).catch(() => ({
    usersCount: 0,
  }));
}

export async function getAdminUserStats(): Promise<UserStats> {
  const user = await requireAdminContext();
  return fetchServiceData<UserStats>({
    service: "user",
    path: "/v1/admin/user/stats",
    user,
  }).catch(() => ({
    feedbackCount: 0,
  }));
}
