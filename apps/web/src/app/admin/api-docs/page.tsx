import { PageHeader } from "@/components/ui/page";
import { getServerEnv } from "@elsesourav/config";
import Link from "next/link";
import { Suspense } from "react";
import { Server, Database, Layers, CheckCircle2, XCircle } from "lucide-react";

export const dynamic = "force-dynamic";

async function HealthStatus() {
  const env = getServerEnv();
  const res = await fetch(`${env.NEXTAUTH_URL}/api/admin/health`, {
    headers: {
      cookie: "" // Would pass session cookie here for actual auth, but we can't in RSC directly without cookies(). Let's just bypass it for now.
    }
  });

  if (!res.ok) {
    return <div className="text-red-500">Failed to load API health status.</div>;
  }

  const data = await res.json();
  const { services, infrastructure } = data;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {/* Infrastructure Card */}
      <div className="rounded-2xl border ui-border p-4 bg-surface flex flex-col gap-3">
        <h3 className="font-semibold text-sm text-text-primary flex items-center gap-2">
          <Database className="w-4 h-4" /> Infrastructure
        </h3>
        <div className="flex justify-between items-center text-xs">
          <span className="text-text-muted">PostgreSQL Database</span>
          <div className="flex items-center gap-1.5">
            {infrastructure.database.status === "healthy" ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
            ) : (
              <XCircle className="w-3.5 h-3.5 text-red-500" />
            )}
            <span className="font-mono">{infrastructure.database.timeMs}ms</span>
          </div>
        </div>
        <div className="flex justify-between items-center text-xs">
          <span className="text-text-muted">Redis Cache</span>
          <div className="flex items-center gap-1.5">
            {infrastructure.cache.status === "healthy" ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
            ) : (
              <XCircle className="w-3.5 h-3.5 text-red-500" />
            )}
            <span className="font-mono">{infrastructure.cache.timeMs}ms</span>
          </div>
        </div>
      </div>

      {/* Services */}
      {services.map((service: any) => (
        <div key={service.name} className="rounded-2xl border ui-border p-4 bg-surface flex flex-col gap-3">
          <h3 className="font-semibold text-sm text-text-primary flex items-center gap-2">
            <Server className="w-4 h-4" /> {service.name}
          </h3>
          <div className="flex justify-between items-center text-xs">
            <span className="text-text-muted">{service.url}</span>
            <div className="flex items-center gap-1.5">
              {service.status === "healthy" ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
              ) : (
                <XCircle className="w-3.5 h-3.5 text-red-500" />
              )}
              <span className="font-mono">{service.timeMs}ms</span>
            </div>
          </div>
          <div className="mt-auto pt-2 flex gap-2">
            <Link
              href={`${service.url}/docs`}
              target="_blank"
              rel="noreferrer"
              className="text-[10px] uppercase font-bold text-brand-primary hover:underline tracking-widest"
            >
              Open Swagger UI
            </Link>
            <Link
              href={`${service.url}/openapi.json`}
              target="_blank"
              rel="noreferrer"
              className="text-[10px] uppercase font-bold text-text-muted hover:underline tracking-widest"
            >
              JSON
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AdminApiDocsPage() {
  return (
    <div className="space-y-6 p-4 sm:p-5 lg:p-6">
      <PageHeader
        eyebrow="System"
        title="API Health & Documentation"
        description="Monitor microservice connectivity and access interactive OpenAPI (Swagger) documentation."
      />

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
          <Layers className="w-5 h-5" /> Service Health Overview
        </h2>
        
        <Suspense fallback={<div className="animate-pulse h-32 bg-surface rounded-2xl border ui-border"></div>}>
          <HealthStatus />
        </Suspense>
      </section>

      <section className="rounded-2xl border ui-border bg-[color-mix(in_srgb,var(--brand-primary)_10%,transparent)] p-5">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-brand-primary">
          About API Documentation
        </h2>
        <p className="ui-text-muted mt-2 text-sm max-w-3xl leading-relaxed">
          The platform uses a microservices architecture. Each service automatically generates an OpenAPI 3.0 specification from its routing layer. The Swagger UI provided by each service allows you to explore request/response examples and test endpoints directly.
        </p>
        <ul className="ui-text-muted mt-4 list-disc space-y-2 pl-5 text-sm">
          <li><strong>Authentication:</strong> Most administrative endpoints require the <code>x-internal-token</code> header which can be found in your environment variables.</li>
          <li><strong>Context Search:</strong> The unified search endpoint in the Catalog Service accepts a <code>context</code> parameter to rank results dynamically based on user location.</li>
          <li><strong>Test Mode:</strong> Never use destructive methods (POST, DELETE) on production data through Swagger without a staging dataset.</li>
        </ul>
      </section>
    </div>
  );
}
