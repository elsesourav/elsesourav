import { PageHeader, PageShell } from "@/components/ui/page";
import { fetchServiceData } from "@/lib/service-client";
import { formatDateTime, type PublicFeedbackItem } from "@/lib/view-models";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function FeedbackPage() {
  const feedback = await fetchServiceData<PublicFeedbackItem[]>({
    service: "user",
    path: "/v1/user/feedback?limit=25",
  }).catch(() => []);

  return (
    <PageShell width="content" className="gap-6">
      <PageHeader
        eyebrow="Community"
        title="Recent Feedback"
        description="Latest public feedback records from the database."
      />

      {feedback.length === 0 ? (
        <p className="text-sm text-[#4a5262]">No feedback published yet.</p>
      ) : (
        <section className="grid gap-3">
          {feedback.map((item) => (
            <article
              key={item.id}
              className="rounded-xl border border-black/15 bg-white p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-[#111722]">
                  {item.app.title}
                </p>
                <p className="text-xs text-[#4a5262]">
                  {item.rating}/5 · {formatDateTime(item.createdAt)}
                </p>
              </div>
              <p className="mt-2 text-sm text-[#3f4757]">{item.message}</p>
              <p className="mt-2 text-xs text-[#4a5262]">
                by {item.user.name ?? "Anonymous"}
              </p>
              <Link
                href={`/apps/${item.app.slug}`}
                className="mt-3 inline-block text-sm font-medium underline"
              >
                Open app
              </Link>
            </article>
          ))}
        </section>
      )}
    </PageShell>
  );
}
