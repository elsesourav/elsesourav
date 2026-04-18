import { MarkdownContent } from "@/components/ui/markdown-content";
import { PageHeader, PageShell } from "@/components/ui/page";
import { fetchServiceData } from "@/lib/service-client";
import {
  formatDateTime,
  type PublicContentPageListItem,
} from "@/lib/view-models";
import { notFound } from "next/navigation";

type ContentPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function ContentPage({ params }: ContentPageProps) {
  const { slug } = await params;

  const page = await fetchServiceData<PublicContentPageListItem>({
    service: "content",
    path: `/v1/content/pages/${slug}`,
  }).catch(() => null);

  if (!page) {
    notFound();
  }

  return (
    <PageShell width="content" className="gap-6">
      <PageHeader
        eyebrow="Rich Content"
        title={page.title}
        description={`Published ${formatDateTime(page.publishedAt ?? page.updatedAt)}`}
      />

      {page.summary ? (
        <article className="ui-card rounded-xl border p-4">
          <MarkdownContent markdown={page.summary} />
        </article>
      ) : null}

      <article className="ui-card rounded-xl border p-5 leading-7 ui-text-primary shadow-[0_14px_30px_-24px_rgba(20,23,31,0.65)]">
        <MarkdownContent markdown={page.body} />
      </article>
    </PageShell>
  );
}
