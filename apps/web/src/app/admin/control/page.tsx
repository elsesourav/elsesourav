import { LinkCard, PageHeader, PageShell } from "@/components/ui/page";
import { AdminControlClient } from "./client";

export const dynamic = "force-dynamic";

const controlLinks = [
  { href: "/admin/store/sections", title: "Open section items page" },
  { href: "/admin/store/banners", title: "Open banners page" },
  { href: "/admin/content/pages", title: "Open content pages" },
  { href: "/admin/theme/configs", title: "Open theme configs" },
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
