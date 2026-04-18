import { PageHeader, PageShell } from "@/components/ui/page";
import { fetchServiceData } from "@/lib/service-client";
import { formatDateTime } from "@/lib/view-models";
import Link from "next/link";

type HelpCategory = {
  id: string;
  name: string;
  slug: string;
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
  title: "Help Center",
  description: "Find guides, troubleshooting steps, and feature documentation.",
};

export const dynamic = "force-dynamic";

export default async function HelpPage() {
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

  return (
    <PageShell width="content" className="gap-6">
      <PageHeader
        eyebrow="Help"
        title="Help Center"
        description="Guides, FAQs, and troubleshooting resources for users and admins."
      />

      {categories.length > 0 ? (
        <section className="grid gap-3 sm:grid-cols-2">
          {categories.map((category) => (
            <article
              key={category.id}
              className="ui-card ui-text-primary rounded-xl border p-4 text-sm"
            >
              <p className="ui-text-heading font-semibold">{category.name}</p>
              <p className="ui-text-muted mt-1">
                {(category._count?.articles ?? 0).toLocaleString()} articles
              </p>
            </article>
          ))}
        </section>
      ) : null}

      {articles.length === 0 ? (
        <p className="ui-text-muted text-sm">No help articles published yet.</p>
      ) : (
        <section className="grid gap-3">
          {articles.map((article) => (
            <article key={article.id} className="ui-card rounded-xl border p-4">
              <p className="ui-text-muted text-xs uppercase tracking-wide">
                {formatDateTime(article.publishedAt)}
              </p>
              <h2 className="ui-text-heading mt-1 text-lg font-semibold">
                <Link
                  href={`/help/${article.slug}`}
                  className="hover:underline"
                >
                  {article.title}
                </Link>
              </h2>
              {article.summary ? (
                <p className="ui-text-muted mt-2 text-sm">{article.summary}</p>
              ) : null}
              {article.category ? (
                <p className="ui-text-muted mt-2 text-xs">
                  {article.category.name}
                </p>
              ) : null}
            </article>
          ))}
        </section>
      )}
    </PageShell>
  );
}
