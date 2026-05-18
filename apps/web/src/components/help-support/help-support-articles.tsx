import AppsIcon from "@/components/icons/AppsIcon";
import HelpAndSupportIcon from "@/components/icons/HelpAndSupportIcon";
import HomeIcon from "@/components/icons/HomeIcon";
import { Card, CardTitle } from "@/components/ui/card";
import { formatDateTime } from "@/lib/view-models";
import Link from "next/link";
import type { HelpArticle, HelpCategory } from "./types";

export function HelpSupportArticles({
  featuredArticle,
  categories,
  articles,
}: {
  featuredArticle: HelpArticle | null;
  categories: HelpCategory[];
  articles: HelpArticle[];
}) {
  return (
    <>
      {featuredArticle ? (
        <section className="overflow-hidden rounded-3xl border border-black/10 bg-white shadow-[0_18px_40px_-30px_rgba(20,23,31,0.55)]">
          <div className="space-y-2 p-5">
            <p className="text-xs uppercase tracking-[0.14em] text-[#657086]">
              Featured guide
            </p>
            <h2 className="text-xl font-semibold text-[#0f131d]">
              <Link
                href={`/help/${featuredArticle.slug}`}
                className="hover:underline"
              >
                {featuredArticle.title}
              </Link>
            </h2>
            {featuredArticle.summary ? (
              <p className="text-sm text-[#435064]">
                {featuredArticle.summary}
              </p>
            ) : null}
            <p className="text-xs text-[#657086]">
              {formatDateTime(featuredArticle.publishedAt)}
            </p>
          </div>
        </section>
      ) : null}

      {categories.length > 0 ? (
        <section className="space-y-3">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-[#0f131d]">Topics</h2>
              <p className="mt-1 text-sm text-[#556171]">
                Browse by topic to find the right guide faster.
              </p>
            </div>
            <Link
              href="/help"
              className="text-sm font-semibold text-[#1f5ed4] underline decoration-black/20 underline-offset-4"
            >
              View all topics
            </Link>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {categories.map((category) => (
              <article
                key={category.id}
                className="rounded-[1.35rem] border border-black/10 bg-white p-4 shadow-[0_14px_30px_-24px_rgba(20,23,31,0.65)]"
              >
                <p className="text-xs uppercase tracking-[0.14em] text-[#657086]">
                  Category
                </p>
                <p className="mt-1 text-lg font-semibold text-[#0f131d]">
                  {category.name}
                </p>
                {category.description ? (
                  <p className="mt-2 line-clamp-3 text-sm text-[#435064]">
                    {category.description}
                  </p>
                ) : null}
                <p className="mt-3 text-xs text-[#657086]">
                  {(category._count?.articles ?? 0).toLocaleString()} articles
                </p>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {articles.length === 0 ? (
        <p className="text-sm text-[#556171]">
          No help articles published yet.
        </p>
      ) : (
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-[#0f131d]">
            Latest guides
          </h2>
          <div className="grid gap-3">
            {articles.map((article) => (
              <article
                key={article.id}
                className="rounded-[1.35rem] border border-black/10 bg-white p-4 shadow-[0_14px_30px_-24px_rgba(20,23,31,0.65)]"
              >
                <p className="text-xs uppercase tracking-[0.14em] text-[#657086]">
                  {formatDateTime(article.publishedAt)}
                </p>
                <h3 className="mt-1 text-lg font-semibold text-[#0f131d]">
                  <Link
                    href={`/help/${article.slug}`}
                    className="hover:underline"
                  >
                    {article.title}
                  </Link>
                </h3>
                {article.summary ? (
                  <p className="mt-2 text-sm text-[#435064]">
                    {article.summary}
                  </p>
                ) : null}
                {article.category ? (
                  <p className="mt-2 text-xs text-[#657086]">
                    {article.category.name}
                  </p>
                ) : null}
              </article>
            ))}
          </div>
        </section>
      )}

      <Card className="space-y-3 text-sm ui-text-primary">
        <CardTitle>More places to explore</CardTitle>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/"
            className="ui-border ui-surface inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium text-secondary hover:bg-[color-mix(in_srgb,var(--background)_84%,var(--brand-secondary)_16%)]"
          >
            <HomeIcon className="h-4 w-4 fill-[#1f5ed4]" />
            Home
          </Link>
          <Link
            href="/apps"
            className="ui-border ui-surface inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium text-secondary hover:bg-[color-mix(in_srgb,var(--background)_84%,var(--brand-secondary)_16%)]"
          >
            <AppsIcon className="h-4 w-4 fill-[#1f5ed4]" />
            Apps
          </Link>
          <Link
            href="/help"
            className="ui-border ui-surface inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium text-secondary hover:bg-[color-mix(in_srgb,var(--background)_84%,var(--brand-secondary)_16%)]"
          >
            <HelpAndSupportIcon className="h-4 w-4 fill-[#1f5ed4]" />
            Help center
          </Link>
        </div>
      </Card>
    </>
  );
}
