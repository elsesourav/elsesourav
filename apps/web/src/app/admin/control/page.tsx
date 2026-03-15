import { LinkCard, PageHeader, PageShell } from "@/components/ui/page";
import { AdminControlClient } from "./client";

export const dynamic = "force-dynamic";

const controlLinks = [
  { href: "/api/admin/store/sections/items", title: "View section items" },
  { href: "/api/admin/store/banners", title: "View banners" },
  { href: "/api/admin/content/pages", title: "View content pages" },
  { href: "/api/admin/theme/configs", title: "View theme configs" },
] as const;

export default function AdminControlPage() {
  return (
    <PageShell width="wide" className="gap-6">
      <PageHeader
        eyebrow="Admin Controls"
        title="Microservice control panel"
        description="Manage store sections, banners, dynamic pages, and theme presets from one place."
      />

      <section className="grid gap-3 sm:grid-cols-2">
        {controlLinks.map((item) => (
          <LinkCard key={item.href} href={item.href} title={item.title} />
        ))}
      </section>

      <AdminControlClient />
    </PageShell>
  );
}
