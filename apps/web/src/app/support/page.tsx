import AboutIcon from "@/components/icons/AboutIcon";
import AppsIcon from "@/components/icons/AppsIcon";
import BlogIcon from "@/components/icons/BlogIcon";
import DashboardIcon from "@/components/icons/DashboardIcon";
import HelpAndSupportIcon from "@/components/icons/HelpAndSupportIcon";
import HomeIcon from "@/components/icons/HomeIcon";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { PageHeader, PageShell } from "@/components/ui/page";
import { fetchServiceData } from "@/lib/service-client";
import { formatDateTime } from "@/lib/view-models";
import Link from "next/link";

type HelpCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  _count?: {
    articles: number;
  };
};

type HelpArticle = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  publishedAt: string | null;
  category: {
    id: string;
    name: string;
    slug: string;
  } | null;
};

type HelpArticleListResult = {
  items: HelpArticle[];
  pagination: {
    limit: number;
    nextCursor: string | null;
    hasMore: boolean;
  };
};

export const metadata = {
  title: "Help & Support",
  description: "Get fast help for accounts, apps, and billing in one place.",
};

export const dynamic = "force-dynamic";

export default async function SupportPage() {
  const [categories, articles] = await Promise.all([
    fetchServiceData<HelpCategory[]>({
      service: "content",
      path: "/v1/content/help/categories",
    }).catch(() => []),
    fetchServiceData<HelpArticleListResult>({
      service: "content",
      path: "/v1/content/help/articles?limit=24",
    })
      .then((payload) => payload.items)
      .catch(() => []),
  ]);

  const featuredArticle = articles[0] ?? null;

  return (
    <PageShell width="content" className="gap-8 py-10">
      <section className="rounded-4xl border border-black/10 bg-[linear-gradient(135deg,#0d1b3f,#1f5ed4_55%,#8fb1f7)] p-6 text-white shadow-[0_24px_60px_-34px_rgba(20,23,31,0.95)] sm:p-8">
        <div className="flex items-center gap-3 text-xs uppercase tracking-[0.16em] text-white/70">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/12">
            <HelpAndSupportIcon className="h-5 w-5 fill-white" />
          </span>
          Help & Support
        </div>
        <h1 className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl sm:leading-[1.05]">
          One place for answers, updates, and direct support.
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-white/82 sm:text-base">
          Start with the help center, check product updates, or contact us for
          billing and technical requests.
        </p>
      </section>

      <PageHeader
        eyebrow="Support"
        title="Start here"
        description="Choose the fastest path for answers, guides, and support tickets."
      />

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="space-y-3 text-sm ui-text-primary">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--brand-secondary)_12%,white_88%)]">
              <HelpAndSupportIcon className="h-5 w-5 fill-[#1f5ed4]" />
            </span>
            <div>
              <CardTitle>Help Center</CardTitle>
              <CardDescription>
                Guides, how-tos, and release notes.
              </CardDescription>
            </div>
          </div>
          <Link
            href="/help"
            className="text-sm font-semibold text-[#1f5ed4] underline decoration-black/20 underline-offset-4"
          >
            Browse help articles
          </Link>
        </Card>
        <Card className="space-y-3 text-sm ui-text-primary">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--brand-secondary)_12%,white_88%)]">
              <AppsIcon className="h-5 w-5 fill-[#1f5ed4]" />
            </span>
            <div>
              <CardTitle>App Support</CardTitle>
              <CardDescription>
                Install, configure, and troubleshoot apps.
              </CardDescription>
            </div>
          </div>
          <p className="text-sm text-[#556171]">
            Response target: within 24-48 hours.
          </p>
        </Card>
        <Card className="space-y-3 text-sm ui-text-primary">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--brand-secondary)_12%,white_88%)]">
              <DashboardIcon className="h-5 w-5 fill-[#1f5ed4]" />
            </span>
            <div>
              <CardTitle>Billing & Account</CardTitle>
              <CardDescription>
                Invoices, refunds, and plan changes.
              </CardDescription>
            </div>
          </div>
          <p className="text-sm text-[#556171]">
            Response target: within 2 business days.
          </p>
        </Card>
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        <Card className="space-y-3 text-sm ui-text-primary">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--brand-secondary)_12%,white_88%)]">
              <BlogIcon className="h-5 w-5 fill-[#1f5ed4]" />
            </span>
            <div>
              <CardTitle>Product Updates</CardTitle>
              <CardDescription>
                News, changelogs, and launch notes.
              </CardDescription>
            </div>
          </div>
          <Link
            href="/blog"
            className="text-sm font-semibold text-[#1f5ed4] underline decoration-black/20 underline-offset-4"
          >
            Read the blog
          </Link>
        </Card>
        <Card className="space-y-3 text-sm ui-text-primary">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--brand-secondary)_12%,white_88%)]">
              <AboutIcon className="h-5 w-5 fill-[#1f5ed4]" />
            </span>
            <div>
              <CardTitle>Contact Support</CardTitle>
              <CardDescription>
                Send a direct request to the team.
              </CardDescription>
            </div>
          </div>
          <Link
            href="/contact"
            className="text-sm font-semibold text-[#1f5ed4] underline decoration-black/20 underline-offset-4"
          >
            Open contact page
          </Link>
        </Card>
      </section>

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
            className="ui-border ui-surface inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium text-(--brand-secondary) hover:bg-[color-mix(in_srgb,var(--background)_84%,var(--brand-secondary)_16%)]"
          >
            <HomeIcon className="h-4 w-4 fill-[#1f5ed4]" />
            Home
          </Link>
          <Link
            href="/apps"
            className="ui-border ui-surface inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium text-(--brand-secondary) hover:bg-[color-mix(in_srgb,var(--background)_84%,var(--brand-secondary)_16%)]"
          >
            <AppsIcon className="h-4 w-4 fill-[#1f5ed4]" />
            Apps
          </Link>
          <Link
            href="/help"
            className="ui-border ui-surface inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium text-(--brand-secondary) hover:bg-[color-mix(in_srgb,var(--background)_84%,var(--brand-secondary)_16%)]"
          >
            <HelpAndSupportIcon className="h-4 w-4 fill-[#1f5ed4]" />
            Help center
          </Link>
        </div>
      </Card>
    </PageShell>
  );
}
