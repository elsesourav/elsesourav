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

const dataPageLinks = [
  { href: "/admin/apps", title: "Apps" },
  { href: "/admin/categories", title: "Categories" },
  { href: "/admin/users", title: "Users" },
  { href: "/admin/feedback", title: "Feedback" },
  { href: "/admin/store/sections", title: "Store sections" },
  { href: "/admin/store/banners", title: "Store banners" },
  { href: "/admin/content/pages", title: "Content pages" },
  { href: "/admin/theme/configs", title: "Theme configs" },
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
        className="inline-flex w-fit rounded-lg border border-black/20 bg-white px-3 py-2 text-xs font-semibold text-[#14171f] shadow-[0_14px_30px_-24px_rgba(20,23,31,0.65)] hover:bg-[#f7f8fb]"
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
              className="rounded-xl border border-black/10 bg-white p-3 text-sm shadow-[0_14px_30px_-24px_rgba(20,23,31,0.65)]"
            >
              <p className="font-semibold text-[#121722]">{app.title}</p>
              <p className="text-[#4a5262]">{app.status}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        {dataPageLinks.map((item) => (
          <LinkCard key={item.href} href={item.href} title={item.title} />
        ))}
      </section>
    </PageShell>
  );
}
