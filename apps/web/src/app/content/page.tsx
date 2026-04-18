import { PageHeader, PageShell } from "@/components/ui/page";
import { markdownExcerpt } from "@/lib/markdown";
import { fetchServiceData } from "@/lib/service-client";
import {
  formatDateTime,
  type PublicContentPageListItem,
} from "@/lib/view-models";
import Link from "next/link";

type ContentPageListResult = {
  items: PublicContentPageListItem[];
  pagination: {
    limit: number;
    nextCursor: string | null;
    hasMore: boolean;
  };
};

export const metadata = {
  title: "Pages",
  description:
    "Published pages from the rich content editor, including policies, product notes, and guides.",
};

export const dynamic = "force-dynamic";

function toExcerpt(page: PublicContentPageListItem): string {
  const source = (
    page.summary && page.summary.trim().length > 0 ? page.summary : page.body
  ).trim();

  return markdownExcerpt(source, 240, "No preview available.");
}

export default async function ContentIndexPage() {
  const pages = await fetchServiceData<ContentPageListResult>({
    service: "content",
    path: "/v1/content/pages?limit=24",
  })
    .then((payload) => payload.items)
    .catch(() => []);

  return (
    <PageShell width="content" className="gap-6">
      <PageHeader
        eyebrow="Rich Content"
        title="Pages"
        description="Browse published long-form pages managed from the admin rich editor."
      />

      {pages.length === 0 ? (
        <p className="ui-text-muted text-sm">
          No published pages are available yet.
        </p>
      ) : (
        <section className="grid gap-3">
          {pages.map((page) => (
            <article key={page.id} className="ui-card rounded-xl border p-4">
              <p className="ui-text-muted text-xs uppercase tracking-wide">
                {formatDateTime(page.publishedAt ?? page.updatedAt)}
              </p>
              <h2 className="ui-text-heading mt-1 text-xl font-semibold">
                <Link
                  href={`/content/${page.slug}`}
                  className="hover:underline"
                >
                  {page.title}
                </Link>
              </h2>
              <p className="ui-text-muted mt-2 text-sm">{toExcerpt(page)}</p>
            </article>
          ))}
        </section>
      )}
    </PageShell>
  );
}
