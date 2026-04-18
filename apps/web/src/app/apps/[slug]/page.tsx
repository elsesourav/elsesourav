import { MarkdownContent } from "@/components/ui/markdown-content";
import { PageHeader, PageShell } from "@/components/ui/page";
import { fetchServiceData } from "@/lib/service-client";
import {
  formatPrice,
  type AppDetail,
  type AppFeedback,
} from "@/lib/view-models";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AppDetailActions } from "./app-detail-actions";

export const dynamic = "force-dynamic";

function formatCompactCount(value?: number | null): string {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "0";
  }

  return new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function formatRating(value?: number | string | null): string {
  const numericValue = Number(value ?? 0);

  if (!Number.isFinite(numericValue)) {
    return "0.0";
  }

  return numericValue.toFixed(1);
}

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
        {app.tags.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {app.tags.map((tag) => (
              <span
                key={tag.id}
                className="rounded-full border border-black/10 bg-[#f7f9fc] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#4a5262]"
              >
                {tag.name}
              </span>
            ))}
          </div>
        ) : null}

        {app.aggregateStat ? (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            <div className="rounded-xl border border-black/10 bg-white px-3 py-2 text-center text-xs text-[#526074]">
              <p className="font-semibold text-[#14171f]">
                {formatCompactCount(app.aggregateStat.downloadCount)}
              </p>
              <p>Downloads</p>
            </div>
            <div className="rounded-xl border border-black/10 bg-white px-3 py-2 text-center text-xs text-[#526074]">
              <p className="font-semibold text-[#14171f]">
                {formatCompactCount(app.aggregateStat.viewCount)}
              </p>
              <p>Views</p>
            </div>
            <div className="rounded-xl border border-black/10 bg-white px-3 py-2 text-center text-xs text-[#526074]">
              <p className="font-semibold text-[#14171f]">
                {formatRating(app.aggregateStat.averageRating)}
              </p>
              <p>Rating</p>
            </div>
            <div className="rounded-xl border border-black/10 bg-white px-3 py-2 text-center text-xs text-[#526074]">
              <p className="font-semibold text-[#14171f]">
                {formatCompactCount(app.aggregateStat.libraryCount)}
              </p>
              <p>Libraries</p>
            </div>
            <div className="rounded-xl border border-black/10 bg-white px-3 py-2 text-center text-xs text-[#526074]">
              <p className="font-semibold text-[#14171f]">
                {formatCompactCount(app.aggregateStat.feedbackCount)}
              </p>
              <p>Feedback</p>
            </div>
          </div>
        ) : null}
      </section>

      <section className="space-y-3">
        <p className="ui-text-heading">{app.shortDescription}</p>
        <MarkdownContent markdown={app.fullDescription} />
      </section>

      {app.featureGraphicUrl ? (
        <section className="space-y-2">
          <h2 className="text-xl font-medium">Feature graphic</h2>
          <Image
            src={app.featureGraphicUrl}
            alt={`${app.title} feature graphic`}
            width={1200}
            height={600}
            className="h-52 w-full rounded-xl border border-black/10 bg-[#f7f8fb] object-cover"
            unoptimized
          />
        </section>
      ) : null}

      {app.promoVideoUrl ? (
        <section className="space-y-2">
          <h2 className="text-xl font-medium">Promo video</h2>
          <video
            controls
            preload="metadata"
            src={app.promoVideoUrl}
            className="h-56 w-full rounded-xl border border-black/10 bg-black object-contain"
          />
        </section>
      ) : null}

      {app.media.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-xl font-medium">Gallery</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {app.media.map((mediaItem) =>
              mediaItem.type === "VIDEO" ? (
                <video
                  key={mediaItem.id}
                  controls
                  preload="metadata"
                  src={mediaItem.url}
                  className="h-52 w-full rounded-xl border border-black/10 bg-black object-contain"
                />
              ) : (
                <Image
                  key={mediaItem.id}
                  src={mediaItem.url}
                  alt={mediaItem.alt ?? app.title}
                  width={960}
                  height={540}
                  className="h-52 w-full rounded-xl border border-black/10 bg-[#f7f8fb] object-cover"
                  unoptimized
                />
              ),
            )}
          </div>
        </section>
      ) : null}

      <AppDetailActions appId={app.id} slug={app.slug} title={app.title} />

      <section className="grid gap-3 rounded-xl border border-black/10 bg-white p-4 text-sm text-[#3f4757] sm:grid-cols-2">
        <p>Developer: {app.developerName ?? "Unknown"}</p>
        <p>Contains ads: {app.containsAds ? "Yes" : "No"}</p>
        <p>Support email: {app.supportEmail ?? "-"}</p>
        <p>
          Support website:{" "}
          {app.supportWebsiteUrl ? (
            <a
              href={app.supportWebsiteUrl}
              target="_blank"
              rel="noreferrer"
              className="text-[#1f5ed4] underline decoration-black/20"
            >
              Open
            </a>
          ) : (
            "-"
          )}
        </p>
        <p className="sm:col-span-2">
          Privacy policy:{" "}
          {app.privacyPolicyUrl ? (
            <a
              href={app.privacyPolicyUrl}
              target="_blank"
              rel="noreferrer"
              className="text-[#1f5ed4] underline decoration-black/20"
            >
              Open policy
            </a>
          ) : (
            "-"
          )}
        </p>
      </section>

      {app.releaseNotes ? (
        <section className="space-y-2">
          <h2 className="text-xl font-medium">Release notes</h2>
          <MarkdownContent markdown={app.releaseNotes} />
        </section>
      ) : null}

      <section className="space-y-3">
        <h2 className="text-xl font-medium">Links</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {app.links.map((link) => (
            <article
              key={link.id}
              className="ui-card rounded-xl border p-4 text-sm"
            >
              <p className="ui-text-heading font-semibold">{link.platform}</p>
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
          <p className="ui-text-muted text-sm">No feedback yet.</p>
        ) : (
          <div className="grid gap-3">
            {feedbacks.map((item) => (
              <article
                key={item.id}
                className="ui-card rounded-xl border p-4 text-sm"
              >
                <p className="ui-text-heading font-semibold">
                  {item.user.name ?? "Anonymous"}
                </p>
                <p className="ui-text-muted">Rating: {item.rating}/5</p>
                <p className="ui-text-muted mt-1">{item.message}</p>
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
