import { SignOutButton } from "@/app/admin/sign-out-button";
import { auth } from "@/auth";
import {
  LinkCard,
  PageHeader,
  PageShell,
  StatCard,
} from "@/components/ui/page";
import { fetchServiceData } from "@/lib/service-client";
import type { AuthStats, CatalogStats, UserStats } from "@/lib/view-models";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

const apiLinks = [
  { href: "/api/admin/apps", title: "Admin apps API" },
  { href: "/api/admin/categories", title: "Admin categories API" },
  { href: "/api/admin/users", title: "Admin users API" },
  { href: "/api/admin/feedback", title: "Admin feedback API" },
  { href: "/api/admin/store/sections/items", title: "Section items API" },
  { href: "/api/admin/store/banners", title: "Banner manager API" },
  { href: "/api/admin/content/pages", title: "Content manager API" },
  { href: "/api/admin/theme/configs", title: "Theme manager API" },
] as const;

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const user = {
    id: session.user.id,
    role: session.user.role,
  };

  const [catalogStats, authStats, userStats] = await Promise.all([
    fetchServiceData<CatalogStats>({
      service: "catalog",
      path: "/v1/admin/catalog/stats",
      user,
    }),
    fetchServiceData<AuthStats>({
      service: "auth",
      path: "/v1/auth/admin/stats",
      user,
    }),
    fetchServiceData<UserStats>({
      service: "user",
      path: "/v1/admin/user/stats",
      user,
    }),
  ]);

  const appsCount = catalogStats.appsCount;
  const usersCount = authStats.usersCount;
  const feedbackCount = userStats.feedbackCount;
  const categoriesCount = catalogStats.categoriesCount;
  const recentApps = catalogStats.recentApps;

  return (
    <PageShell width="wide">
      <PageHeader
        eyebrow="Admin Panel"
        title="Platform control center"
        description={`Signed in as ${session.user.email}`}
        actions={<SignOutButton />}
      />

      <Link
        href="/admin/control"
        className="inline-flex w-fit rounded-lg border border-neutral-300 bg-white/80 px-3 py-2 text-xs font-medium text-neutral-700 shadow-sm hover:bg-white"
      >
        Open microservice controls
      </Link>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Apps" value={appsCount} />
        <StatCard label="Users" value={usersCount} />
        <StatCard label="Feedback" value={feedbackCount} />
        <StatCard label="Categories" value={categoriesCount} />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-medium">Recent apps</h2>
        <div className="grid gap-2">
          {recentApps.map((app) => (
            <article
              key={app.id}
              className="rounded-xl border border-neutral-200 bg-white/80 p-3 text-sm shadow-sm"
            >
              <p className="font-medium">{app.title}</p>
              <p className="text-neutral-500">{app.status}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        {apiLinks.map((item) => (
          <LinkCard key={item.href} href={item.href} title={item.title} />
        ))}
      </section>
    </PageShell>
  );
}
