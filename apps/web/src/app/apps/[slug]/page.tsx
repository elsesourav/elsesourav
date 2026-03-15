import { PageHeader, PageShell } from "@/components/ui/page";
import { fetchServiceData } from "@/lib/service-client";
import {
  formatPrice,
  type AppDetail,
  type AppFeedback,
} from "@/lib/view-models";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AppDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let app: AppDetail;

  try {
    app = await fetchServiceData<AppDetail>({
      service: "catalog",
      path: `/v1/catalog/apps/${slug}`,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "App not found.") {
      notFound();
    }

    throw error;
  }

  const feedbacks = await fetchServiceData<AppFeedback[]>({
    service: "user",
    path: `/v1/user/feedback?appId=${app.id}&limit=10`,
  }).catch(() => []);

  return (
    <PageShell>
      <PageHeader
        eyebrow={app.category.name}
        title={app.title}
        description={`Version ${app.version} · ${app.isPaid ? formatPrice(app.price) : "Free"}`}
      />

      <section className="space-y-3">
        <p className="text-neutral-700">{app.shortDescription}</p>
        <p className="text-sm leading-7 text-neutral-600">
          {app.fullDescription}
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-medium">Links</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {app.links.map((link) => (
            <article
              key={link.id}
              className="rounded-xl border border-neutral-200 bg-white/80 p-4 text-sm shadow-sm"
            >
              <p className="font-medium">{link.platform}</p>
              <a
                className="mt-2 block text-blue-700 underline"
                href={link.downloadUrl}
                target="_blank"
                rel="noreferrer"
              >
                Download
              </a>
              {link.sourceCodeUrl ? (
                <a
                  className="mt-1 block text-blue-700 underline"
                  href={link.sourceCodeUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Source
                </a>
              ) : null}
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-medium">Recent feedback</h2>
        {feedbacks.length === 0 ? (
          <p className="text-sm text-neutral-500">No feedback yet.</p>
        ) : (
          <div className="grid gap-3">
            {feedbacks.map((item) => (
              <article
                key={item.id}
                className="rounded-xl border border-neutral-200 bg-white/80 p-4 text-sm shadow-sm"
              >
                <p className="font-medium">{item.user.name ?? "Anonymous"}</p>
                <p className="text-neutral-500">Rating: {item.rating}/5</p>
                <p className="mt-1 text-neutral-700">{item.message}</p>
              </article>
            ))}
          </div>
        )}
      </section>

      <Link href="/apps" className="text-sm text-blue-700 underline">
        Back to apps
      </Link>
    </PageShell>
  );
}
