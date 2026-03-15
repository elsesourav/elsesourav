import { PageHeader, PageShell } from "@/components/ui/page";
import type { ApiResponse, ContentPageDto } from "@elsesourav/types";

export const dynamic = "force-dynamic";

function AboutFallback({ message }: { message: string }) {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Dynamic Content"
        title="About"
        description={message}
      />
    </PageShell>
  );
}

export default async function AboutPage() {
  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

  const response = await fetch(`${baseUrl}/api/content/about`, {
    cache: "no-store",
  });

  if (!response.ok) {
    return (
      <AboutFallback message="Content is not published yet. Use admin content manager to publish this page." />
    );
  }

  const payload = (await response.json()) as ApiResponse<ContentPageDto>;

  if (!payload.ok) {
    return <AboutFallback message="Failed to load content." />;
  }

  return (
    <PageShell>
      <PageHeader eyebrow="Dynamic Content" title={payload.data.title} />
      {payload.data.summary ? (
        <p className="mt-3 text-neutral-600">{payload.data.summary}</p>
      ) : null}
      <article className="rounded-xl border border-neutral-200 bg-white/80 p-5 leading-7 text-neutral-800 shadow-sm">
        {payload.data.body}
      </article>
    </PageShell>
  );
}
