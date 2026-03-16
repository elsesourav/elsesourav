import { PageHeader, PageShell } from "@/components/ui/page";
import { fetchServiceData } from "@/lib/service-client";
import {
  formatPrice,
  type AppDetail,
  type AppFeedback,
} from "@/lib/view-models";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AppDetailActions } from "./app-detail-actions";

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
        <p className="text-[#252c39]">{app.shortDescription}</p>
        <p className="text-sm leading-7 text-[#3f4757]">
          {app.fullDescription}
        </p>
      </section>

      <AppDetailActions appId={app.id} slug={app.slug} title={app.title} />

      <section className="space-y-3">
        <h2 className="text-xl font-medium">Links</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {app.links.map((link) => (
            <article
              key={link.id}
              className="rounded-xl border border-black/10 bg-white p-4 text-sm shadow-[0_14px_30px_-24px_rgba(20,23,31,0.65)]"
            >
              <p className="font-semibold text-[#131924]">{link.platform}</p>
              <a
                className="mt-2 block text-[#1f5ed4] underline decoration-black/20"
                href={link.downloadUrl}
                target="_blank"
                rel="noreferrer"
              >
                Download
              </a>
              {link.sourceCodeUrl ? (
                <a
                  className="mt-1 block text-[#1f5ed4] underline decoration-black/20"
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
          <p className="text-sm text-[#4a5262]">No feedback yet.</p>
        ) : (
          <div className="grid gap-3">
            {feedbacks.map((item) => (
              <article
                key={item.id}
                className="rounded-xl border border-black/10 bg-white p-4 text-sm shadow-[0_14px_30px_-24px_rgba(20,23,31,0.65)]"
              >
                <p className="font-semibold text-[#121722]">
                  {item.user.name ?? "Anonymous"}
                </p>
                <p className="text-[#4a5262]">Rating: {item.rating}/5</p>
                <p className="mt-1 text-[#3f4757]">{item.message}</p>
              </article>
            ))}
          </div>
        )}
      </section>

      <Link
        href="/apps"
        className="text-sm text-[#1f5ed4] underline decoration-black/20"
      >
        Back to apps
      </Link>
    </PageShell>
  );
}
