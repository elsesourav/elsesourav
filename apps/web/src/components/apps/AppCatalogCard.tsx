import { formatPrice, type PublicApp } from "@/lib/view-models";
import Image from "next/image";
import Link from "next/link";

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

export default function AppCatalogCard({ app }: { app: PublicApp }) {
  const media = app.media?.[0];
  const stats = app.aggregateStat;
  const tags = app.tags ?? [];

  return (
    <article className="overflow-hidden rounded-3xl border border-black/10 bg-white shadow-[0_18px_40px_-30px_rgba(20,23,31,0.55)] transition-transform duration-300 hover:-translate-y-1">
      <div className="relative aspect-16/10 bg-[linear-gradient(135deg,#eff4ff,#d8e5ff)]">
        {media ? (
          media.type === "VIDEO" ? (
            <video
              src={media.url}
              className="h-full w-full object-cover"
              muted
              playsInline
              autoPlay
              loop
              controls={false}
              preload="metadata"
            />
          ) : (
            <Image
              src={media.url}
              alt={media.alt ?? app.title}
              fill
              sizes="(max-width: 1024px) 100vw, 33vw"
              className="object-cover"
              unoptimized
            />
          )
        ) : app.iconUrl ? (
          <div className="flex h-full items-center justify-center p-8">
            <Image
              src={app.iconUrl}
              alt={`${app.title} icon`}
              width={144}
              height={144}
              className="h-24 w-24 rounded-3xl border border-black/10 bg-white object-cover shadow-sm"
              unoptimized
            />
          </div>
        ) : (
          <div className="flex h-full items-end bg-[linear-gradient(135deg,#123f8f,#1f5ed4_45%,#89aef7)] p-5 text-white">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-white/70">
                ElseSourav
              </p>
              <p className="mt-2 max-w-[18ch] text-2xl font-semibold leading-tight">
                {app.title}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-[#657086]">
              {app.category?.name ?? app.appCategory ?? "App"}
            </p>
            <h2 className="mt-1 text-lg font-semibold text-[#0f131d]">
              {app.title}
            </h2>
          </div>
          <span className="rounded-full bg-[#eef4ff] px-2.5 py-1 text-xs font-semibold text-[#1f5ed4]">
            {app.isPaid ? formatPrice(app.price) : "Free"}
          </span>
        </div>

        <p className="line-clamp-2 text-sm text-[#435064]">
          {app.shortDescription}
        </p>

        <p className="text-xs text-[#657086]">By {app.developerName}</p>

        <div className="flex flex-wrap gap-1.5">
          {tags.slice(0, 4).map((tag) => (
            <span
              key={tag.id}
              className="rounded-full border border-black/10 bg-[#f7f9fc] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#4a5262]"
            >
              {tag.name}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-2 text-xs text-[#526074]">
          <div className="rounded-xl bg-[#f7f9fc] px-2.5 py-2 text-center">
            <p className="font-semibold text-[#14171f]">
              {formatCompactCount(stats?.downloadCount ?? 0)}
            </p>
            <p>Downloads</p>
          </div>
          <div className="rounded-xl bg-[#f7f9fc] px-2.5 py-2 text-center">
            <p className="font-semibold text-[#14171f]">
              {formatCompactCount(stats?.viewCount ?? 0)}
            </p>
            <p>Views</p>
          </div>
          <div className="rounded-xl bg-[#f7f9fc] px-2.5 py-2 text-center">
            <p className="font-semibold text-[#14171f]">
              {formatRating(stats?.averageRating)}
            </p>
            <p>Rating</p>
          </div>
        </div>

        <Link
          href={`/apps/${app.slug}`}
          className="inline-flex rounded-full border border-black/15 bg-white px-4 py-2 text-sm font-semibold text-[#14171f] transition-colors hover:border-[#1f5ed4] hover:text-[#1f5ed4]"
        >
          Open details
        </Link>
      </div>
    </article>
  );
}
