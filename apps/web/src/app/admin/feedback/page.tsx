import { PageHeader, PageShell } from "@/components/ui/page";
import { requireAdminContext } from "@/lib/page-access";
import { fetchServiceData } from "@/lib/service-client";
import { formatDateTime, type AdminFeedbackItem } from "@/lib/view-models";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminFeedbackPage() {
  const user = await requireAdminContext();
  const feedback = await fetchServiceData<AdminFeedbackItem[]>({
    service: "user",
    path: "/v1/admin/user/feedback?includeHidden=true",
    user,
  }).catch(() => []);

  return (
    <PageShell width="wide" className="gap-6">
      <PageHeader
        eyebrow="Admin Data"
        title="Feedback"
        description="Moderation list for user feedback records."
      />

      <Link href="/admin" className="text-sm font-medium underline">
        Back to admin
      </Link>

      {feedback.length === 0 ? (
        <p className="text-sm text-[#4a5262]">No feedback records found.</p>
      ) : (
        <section className="overflow-x-auto rounded-xl border border-black/15 bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-black/10 bg-[#f6f7fb] text-xs uppercase tracking-wide text-[#4a5262]">
              <tr>
                <th className="px-3 py-2">App</th>
                <th className="px-3 py-2">User</th>
                <th className="px-3 py-2">Rating</th>
                <th className="px-3 py-2">Hidden</th>
                <th className="px-3 py-2">Created</th>
                <th className="px-3 py-2">Message</th>
              </tr>
            </thead>
            <tbody>
              {feedback.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-black/10 last:border-0"
                >
                  <td className="px-3 py-2 text-[#364055]">{item.app.title}</td>
                  <td className="px-3 py-2 text-[#364055]">
                    {item.user.name ?? item.user.email}
                  </td>
                  <td className="px-3 py-2 text-[#364055]">{item.rating}/5</td>
                  <td className="px-3 py-2 text-[#364055]">
                    {item.isHidden ? "Yes" : "No"}
                  </td>
                  <td className="px-3 py-2 text-[#364055]">
                    {formatDateTime(item.createdAt)}
                  </td>
                  <td className="px-3 py-2 text-[#364055]">{item.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </PageShell>
  );
}
