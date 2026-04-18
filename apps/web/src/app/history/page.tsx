import { PageHeader, PageShell } from "@/components/ui/page";
import { requireUserContext } from "@/lib/page-access";
import { fetchServiceData } from "@/lib/service-client";
import { formatDateTime, type UserHistoryItem } from "@/lib/view-models";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const user = await requireUserContext();
  const history = await fetchServiceData<UserHistoryItem[]>({
    service: "user",
    path: "/v1/user/history",
    user,
  }).catch(() => []);

  return (
    <PageShell width="content" className="gap-6">
      <PageHeader
        eyebrow="Your Data"
        title="Download History"
        description="Recent download tracking records."
      />

      {history.length === 0 ? (
        <section className="rounded-xl border border-black/15 bg-white p-5 text-sm text-[#4a5262]">
          <p>No download history found yet.</p>
          <Link
            href="/apps"
            className="mt-3 inline-block text-sm font-medium text-[#1f5ed4] underline decoration-black/20"
          >
            Browse apps to start downloading
          </Link>
        </section>
      ) : (
        <>
          <section className="grid gap-3 sm:hidden">
            {history.map((item) => (
              <article
                key={item.id}
                className="rounded-xl border border-black/15 bg-white p-4 shadow-[0_14px_30px_-24px_rgba(20,23,31,0.65)]"
              >
                <p className="text-xs uppercase tracking-wide text-[#4a5262]">
                  {item.platform}
                </p>
                <p className="mt-1 text-sm font-semibold text-[#111722]">
                  {item.app.title}
                </p>
                <p className="mt-1 text-xs text-[#4a5262]">/{item.app.slug}</p>
                <p className="mt-2 text-xs text-[#364055]">
                  {formatDateTime(item.createdAt)}
                </p>
                <Link
                  href={`/apps/${item.app.slug}`}
                  className="mt-3 inline-block text-sm font-medium text-[#1f5ed4] underline decoration-black/20"
                >
                  Open app
                </Link>
              </article>
            ))}
          </section>

          <section className="hidden overflow-x-auto rounded-xl border border-black/15 bg-white sm:block">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-black/10 bg-[#f6f7fb] text-xs uppercase tracking-wide text-[#4a5262]">
                <tr>
                  <th className="px-3 py-2">App</th>
                  <th className="px-3 py-2">Platform</th>
                  <th className="px-3 py-2">When</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-black/10 last:border-0"
                  >
                    <td className="px-3 py-2">
                      <p className="font-medium text-[#111722]">
                        {item.app.title}
                      </p>
                      <p className="text-xs text-[#4a5262]">/{item.app.slug}</p>
                    </td>
                    <td className="px-3 py-2 text-[#364055]">
                      {item.platform}
                    </td>
                    <td className="px-3 py-2 text-[#364055]">
                      {formatDateTime(item.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </>
      )}

      <Link href="/apps" className="text-sm font-medium underline">
        Browse apps
      </Link>
    </PageShell>
  );
}
