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
        <p className="mt-3 text-[#3f4757]">{payload.data.summary}</p>
      ) : null}
      <article className="rounded-xl border border-black/10 bg-white p-5 leading-7 text-[#1f2633] shadow-[0_14px_30px_-24px_rgba(20,23,31,0.65)]">
        {payload.data.body}
      </article>
    </PageShell>
  );
}
