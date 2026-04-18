import { LinkCard, PageHeader } from "@/components/ui/page";
import { getServerEnv } from "@elsesourav/config";
import Link from "next/link";

export const dynamic = "force-dynamic";

const controlLinks = [
  {
    href: "/admin/store/sliders",
    title: "Home sliders",
    description:
      "Manage hero rotations, app-linked campaigns, and timing windows.",
  },
  {
    href: "/admin/store/sections",
    title: "Store sections",
    description: "Manage homepage merchandising lanes and release windows.",
  },
  {
    href: "/admin/store/banners",
    title: "Store banners",
    description: "Control campaign assets, timing, and banner visibility.",
  },
  {
    href: "/admin/content/pages",
    title: "Content pages",
    description: "Review CMS pages with publish schedule and SEO metadata.",
  },
  {
    href: "/admin/theme/configs",
    title: "Theme configs",
    description: "Tune active brand palettes and typography presets.",
  },
] as const;

const servicePorts = [
  {
    name: "Auth Service",
    defaultUrl: "http://localhost:4001",
    envKey: "AUTH_SERVICE_URL",
    summary: "Identity, sessions, and verification lifecycle.",
    tempDetails: {
      version: "v0.1-temp",
      health: "Healthy",
      owner: "Platform Auth",
    },
  },
  {
    name: "Catalog Service",
    defaultUrl: "http://localhost:4002",
    envKey: "CATALOG_SERVICE_URL",
    summary: "Apps, categories, pricing, and store merchandising data.",
    tempDetails: {
      version: "v0.1-temp",
      health: "Healthy",
      owner: "Platform Catalog",
    },
  },
  {
    name: "User Service",
    defaultUrl: "http://localhost:4003",
    envKey: "USER_SERVICE_URL",
    summary: "Library, download history, feedback, and preferences.",
    tempDetails: {
      version: "v0.1-temp",
      health: "Healthy",
      owner: "Platform User",
    },
  },
  {
    name: "Content Service",
    defaultUrl: "http://localhost:4004",
    envKey: "CONTENT_SERVICE_URL",
    summary: "Static pages, blog content, tags, and publish workflows.",
    tempDetails: {
      version: "v0.1-temp",
      health: "Healthy",
      owner: "Platform Content",
    },
  },
  {
    name: "Theme Service",
    defaultUrl: "http://localhost:4005",
    envKey: "THEME_SERVICE_URL",
    summary: "Theme presets and runtime design token configuration.",
    tempDetails: {
      version: "v0.1-temp",
      health: "Healthy",
      owner: "Platform Theme",
    },
  },
] as const;

function serviceBaseUrl(envKey: string, fallback: string) {
  const env = getServerEnv();
  const raw = env[envKey as keyof ReturnType<typeof getServerEnv>];

  if (typeof raw === "string" && raw.length > 0) {
    return raw;
  }

  return fallback;
}

export default function AdminControlPage() {
  return (
    <div className="space-y-5 p-4 sm:p-5 lg:p-6">
      <PageHeader
        eyebrow="System"
        title="API workspace"
        description="Documentation-first API operations with OpenAPI and Swagger links for every microservice."
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

      <section className="grid gap-3 lg:grid-cols-2">
        {servicePorts.map((service) => {
          const baseUrl = serviceBaseUrl(service.envKey, service.defaultUrl);

          return (
            <article
              key={service.name}
              className="ui-card rounded-2xl border p-4"
            >
              <div>
                <h2 className="ui-text-heading text-base font-semibold">
                  {service.name}
                </h2>
                <p className="ui-text-muted mt-1 text-sm">{service.summary}</p>
                <p className="ui-text-muted mt-2 break-all text-xs">
                  {baseUrl}
                </p>
                <div className="mt-2 grid gap-1 text-xs ui-text-muted">
                  <p>Version: {service.tempDetails.version}</p>
                  <p>Health: {service.tempDetails.health}</p>
                  <p>Owner: {service.tempDetails.owner}</p>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <Link
                  href={`${baseUrl}/docs`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg border ui-border bg-[color-mix(in_srgb,var(--background)_90%,white_10%)] px-3 py-1.5 text-xs font-semibold ui-text-primary hover:bg-[color-mix(in_srgb,var(--background)_82%,var(--brand-secondary)_18%)]"
                >
                  Open /docs
                </Link>
                <Link
                  href={`${baseUrl}/openapi.json`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg border ui-border bg-[color-mix(in_srgb,var(--background)_90%,white_10%)] px-3 py-1.5 text-xs font-semibold ui-text-primary hover:bg-[color-mix(in_srgb,var(--background)_82%,var(--brand-secondary)_18%)]"
                >
                  Open /openapi.json
                </Link>
              </div>
            </article>
          );
        })}
      </section>

      <section className="rounded-2xl border ui-border bg-[color-mix(in_srgb,var(--background)_90%,var(--brand-secondary)_10%)] p-4">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-[color-mix(in_srgb,var(--brand-secondary)_84%,var(--foreground)_16%)]">
          API operations guideline
        </h2>
        <p className="ui-text-muted mt-2 text-sm">
          Manual payload testing UI has been removed from admin. Use Swagger UI
          for request exploration, and use stable admin screens for business
          operations.
        </p>
        <ul className="ui-text-muted mt-2 list-disc space-y-1 pl-5 text-sm">
          <li>Use this page to jump into service-level API docs quickly.</li>
          <li>Use admin modules for production write operations.</li>
          <li>Keep OpenAPI schemas updated in each service repository.</li>
        </ul>
      </section>
    </div>
  );
}
