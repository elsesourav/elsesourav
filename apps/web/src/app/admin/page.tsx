import { requireAdminContext } from "@/lib/page-access";
import Link from "next/link";
import { AdminDashboardStats } from "./dashboard-stats";
import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query";
import { getAdminAuthStats, getAdminCatalogStats, getAdminUserStats } from "./actions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Activity, LayoutGrid, Users, MessageSquare, Megaphone, FileText, Settings, Rocket, ArrowRight } from "lucide-react";
import { ActivityStream } from "./activity-stream";
import { SupportWidget } from "./support-widget";

export const dynamic = "force-dynamic";

const quickRoutes = [
  { href: "/admin/apps", title: "Apps", summary: "Manage catalog app records.", icon: LayoutGrid },
  { href: "/admin/users", title: "Users", summary: "Review roles and account status.", icon: Users },
  { href: "/admin/feedback", title: "Feedback", summary: "Moderate incoming submissions.", icon: MessageSquare },
  { href: "/admin/store/banners", title: "Store banners", summary: "Schedule and place banners.", icon: Megaphone },
  { href: "/admin/content/pages", title: "Pages", summary: "Edit static content pages.", icon: FileText },
  { href: "/admin/theme/configs", title: "Theme configs", summary: "Manage visual brand presets.", icon: Settings },
] as const;

export default async function AdminPage() {
  const user = await requireAdminContext();
  const displayName = user.email?.split("@")[0] ?? "Admin";

  const queryClient = new QueryClient();

  // Prefetch data on the server
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: ["admin", "catalogStats"],
      queryFn: () => getAdminCatalogStats(),
    }),
    queryClient.prefetchQuery({
      queryKey: ["admin", "authStats"],
      queryFn: () => getAdminAuthStats(),
    }),
    queryClient.prefetchQuery({
      queryKey: ["admin", "userStats"],
      queryFn: () => getAdminUserStats(),
    }),
  ]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-text-primary">
          Overview
        </h1>
        <p className="text-sm text-text-muted">
          Monitor your application metrics, recent activity, and system health.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4 bg-gradient-to-br from-brand-primary to-brand-secondary text-brand-primary-foreground border-transparent">
          <CardHeader>
            <CardTitle className="text-brand-primary-foreground text-xl flex items-center gap-2">
              <Rocket className="h-5 w-5 text-brand-accent" />
              Welcome back, {displayName}
            </CardTitle>
            <CardDescription className="text-brand-primary-foreground/70">
              Your platform is performing optimally today. You have {user.role === "ADMIN" ? "full" : "limited"} access.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mt-2">
              <button className="bg-brand-accent hover:bg-brand-accent-hover text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                View Reports
              </button>
              <button className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors backdrop-blur-sm">
                System Health
              </button>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-lg">Account Snapshot</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center border-b border-border-subtle pb-3">
              <span className="text-sm font-medium text-text-muted">Email</span>
              <span className="text-sm text-text-primary">{user.email ?? "Unknown"}</span>
            </div>
            <div className="flex justify-between items-center border-b border-border-subtle pb-3">
              <span className="text-sm font-medium text-text-muted">Role</span>
              <span className="inline-flex items-center rounded-full bg-status-info-bg px-2.5 py-0.5 text-xs font-semibold text-status-info">
                {user.role}
              </span>
            </div>
          </CardContent>
        </Card>
      </section>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="lg:col-span-4 space-y-8">
          <HydrationBoundary state={dehydrate(queryClient)}>
            <AdminDashboardStats />
          </HydrationBoundary>
        </div>

        <div className="lg:col-span-3 space-y-8">
          <SupportWidget />
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="space-y-1">
                <CardTitle className="text-lg">Recent Activity</CardTitle>
                <CardDescription>Latest events across the platform</CardDescription>
              </div>
              <Activity className="h-4 w-4 text-text-muted" />
            </CardHeader>
            <CardContent>
              <ActivityStream />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
              <CardDescription>Jump straight to operations</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2">
              {quickRoutes.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="group flex items-center justify-between rounded-md p-3 hover:bg-surface-hover transition-colors border border-transparent hover:border-border-subtle"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-md bg-surface-active flex items-center justify-center text-text-muted group-hover:text-brand-primary group-hover:bg-brand-primary/5 transition-colors">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-text-primary">{item.title}</p>
                        <p className="text-xs text-text-muted">{item.summary}</p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-text-muted opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </Link>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
