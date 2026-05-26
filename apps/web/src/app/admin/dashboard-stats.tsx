"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { Suspense } from "react";
import {
  getAdminCatalogStats,
  getAdminAuthStats,
  getAdminUserStats,
} from "./actions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { AppWindow, Users, MessageSquare, TrendingUp } from "lucide-react";

function CatalogWidget() {
  const { data: catalogStats } = useSuspenseQuery({
    queryKey: ["admin", "catalogStats"],
    queryFn: () => getAdminCatalogStats(),
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Catalog Apps</CardTitle>
        <AppWindow className="h-4 w-4 text-text-muted" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{catalogStats.appsCount.toLocaleString()}</div>
        <p className="text-xs text-text-muted flex items-center gap-1 mt-1">
          <TrendingUp className="h-3 w-3 text-status-success" />
          <span className="text-status-success">+4.5%</span> from last month
        </p>
      </CardContent>
    </Card>
  );
}

function AuthWidget() {
  const { data: authStats } = useSuspenseQuery({
    queryKey: ["admin", "authStats"],
    queryFn: () => getAdminAuthStats(),
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
        <Users className="h-4 w-4 text-text-muted" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{authStats.usersCount.toLocaleString()}</div>
        <p className="text-xs text-text-muted flex items-center gap-1 mt-1">
          <TrendingUp className="h-3 w-3 text-status-success" />
          <span className="text-status-success">+12%</span> from last month
        </p>
      </CardContent>
    </Card>
  );
}

function FeedbackWidget() {
  const { data: userStats } = useSuspenseQuery({
    queryKey: ["admin", "userStats"],
    queryFn: () => getAdminUserStats(),
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Feedback Entries</CardTitle>
        <MessageSquare className="h-4 w-4 text-text-muted" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{userStats.feedbackCount.toLocaleString()}</div>
        <p className="text-xs text-text-muted flex items-center gap-1 mt-1">
          Pending moderation queue
        </p>
      </CardContent>
    </Card>
  );
}

function RecentAppsWidget() {
  const { data: catalogStats } = useSuspenseQuery({
    queryKey: ["admin", "catalogStats"],
    queryFn: () => getAdminCatalogStats(),
  });

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle className="text-lg">Recent Apps</CardTitle>
        <CardDescription>Latest additions to the catalog</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {catalogStats.recentApps.length === 0 ? (
            <p className="text-sm text-text-muted">No recent apps available.</p>
          ) : null}
          {catalogStats.recentApps.map((app) => (
            <div key={app.id} className="flex items-center justify-between border-b border-border-subtle pb-4 last:border-0 last:pb-0">
              <div className="flex flex-col gap-1">
                <span className="font-medium text-text-primary">{app.title}</span>
                <span className="text-xs text-text-muted">/{app.slug}</span>
              </div>
              <Badge
                variant={
                  app.status === "PUBLISHED" ? "success"
                    : app.status === "DRAFT" ? "warning"
                      : app.status === "ARCHIVED" ? "destructive"
                        : "default"
                }
              >
                {app.status}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function WidgetSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4 rounded-full" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-16 mb-2" />
        <Skeleton className="h-3 w-32" />
      </CardContent>
    </Card>
  );
}

export function AdminDashboardStats() {
  return (
    <>
      <section className="grid gap-4 sm:grid-cols-3">
        <Suspense fallback={<WidgetSkeleton />}>
          <CatalogWidget />
        </Suspense>
        <Suspense fallback={<WidgetSkeleton />}>
          <AuthWidget />
        </Suspense>
        <Suspense fallback={<WidgetSkeleton />}>
          <FeedbackWidget />
        </Suspense>
      </section>

      <Suspense fallback={
        <Card className="mt-8">
          <CardHeader><Skeleton className="h-6 w-32 mb-2" /><Skeleton className="h-4 w-48" /></CardHeader>
          <CardContent><Skeleton className="h-32 w-full" /></CardContent>
        </Card>
      }>
        <RecentAppsWidget />
      </Suspense>
    </>
  );
}
