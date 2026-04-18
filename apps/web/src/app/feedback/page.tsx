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
        <p className="ui-text-muted text-sm">No feedback published yet.</p>
      ) : (
        <section className="grid gap-3">
          {feedback.map((item) => (
            <article key={item.id} className="ui-card rounded-xl border p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="ui-text-heading text-sm font-semibold">
                  {item.app.title}
                </p>
                <p className="ui-text-muted text-xs">
                  {item.rating}/5 · {formatDateTime(item.createdAt)}
                </p>
              </div>
              <p className="ui-text-muted mt-2 text-sm">{item.message}</p>
              <p className="ui-text-muted mt-2 text-xs">
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
