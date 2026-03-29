import { LinkCard, PageHeader } from "@/components/ui/page";
import { AdminControlClient } from "./client";

export const dynamic = "force-dynamic";

const controlLinks = [
  {
    href: "/admin/store/sections",
    title: "Store sections",
    description: "Manage featured, latest, and upcoming app placements.",
  },
  {
    href: "/admin/store/banners",
    title: "Store banners",
    description: "Control campaign copy, timing windows, and visibility.",
  },
  {
    href: "/admin/content/pages",
    title: "Content pages",
    description: "Review CMS-driven pages and publishing status.",
  },
  {
    href: "/admin/theme/configs",
    title: "Theme configs",
    description: "Inspect and tune active visual presets.",
  },
] as const;

export default function AdminControlPage() {
  return (
    <div className="space-y-5 p-4 sm:p-5 lg:p-6">
      <PageHeader
        eyebrow="Admin Controls"
        title="Microservice control panel"
        description="Manage store sections, banners, dynamic pages, and theme presets from one place."
      />

      <section className="grid gap-3 sm:grid-cols-2">
        {controlLinks.map((item) => (
          <LinkCard
            key={item.href}
            href={item.href}
            title={item.title}
            description={item.description}
          />
        ))}
      </section>

      <section className="rounded-2xl border border-black/10 bg-[#f6f9ff] p-4">
        <h2 className="text-sm font-semibold uppercase tracking-[0.1em] text-[#1f5ed4]">
          Direct payload controls
        </h2>
        <p className="mt-2 text-sm text-[#44506a]">
          Use these forms for direct API payload testing across catalog,
          content, and theme services.
        </p>
      </section>

      <AdminControlClient />
    </div>
  );
}
