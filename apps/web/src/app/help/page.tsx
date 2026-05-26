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
    <div className="space-y-12">
      <div className="flex flex-col space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight text-text-heading sm:text-5xl">
          Help Center
        </h1>
        <p className="text-lg text-text-muted max-w-2xl">
          Guides, FAQs, and troubleshooting resources for users and admins.
        </p>
      </div>

      {categories.length > 0 ? (
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Link key={category.id} href={`/help?categorySlug=${category.slug}`}>
              <article className="ui-card group relative rounded-2xl border p-5 transition-all hover:border-brand-primary/50 hover:shadow-md">
                <p className="ui-text-heading font-semibold group-hover:text-brand-primary transition-colors">
                  {category.name}
                </p>
                <p className="ui-text-muted mt-2 text-sm">
                  {(category._count?.articles ?? 0).toLocaleString()} articles
                </p>
              </article>
            </Link>
          ))}
        </section>
      ) : null}

      <div>
        <h2 className="text-2xl font-bold tracking-tight text-text-heading mb-6">Latest Articles</h2>
        {articles.length === 0 ? (
          <div className="ui-card p-12 text-center text-text-muted rounded-2xl border">
            No help articles published yet.
          </div>
        ) : (
          <section className="grid gap-4 sm:grid-cols-2">
            {articles.map((article) => (
              <Link key={article.id} href={`/help/${article.slug}`}>
                <article className="ui-card group h-full rounded-2xl border p-5 transition-all hover:border-brand-primary/50 hover:shadow-md">
                  <p className="ui-text-muted text-[10px] font-bold uppercase tracking-wider mb-2">
                    {formatDateTime(article.publishedAt)}
                  </p>
                  <h3 className="ui-text-heading text-lg font-semibold group-hover:text-brand-primary transition-colors">
                    {article.title}
                  </h3>
                  {article.summary ? (
                    <p className="ui-text-muted mt-3 text-sm line-clamp-2">
                      {article.summary}
                    </p>
                  ) : null}
                </article>
              </Link>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}
