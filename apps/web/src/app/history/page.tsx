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
        <p className="text-sm text-[#4a5262]">No download history found.</p>
      ) : (
        <section className="overflow-x-auto rounded-xl border border-black/15 bg-white">
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
                  <td className="px-3 py-2 text-[#364055]">{item.platform}</td>
                  <td className="px-3 py-2 text-[#364055]">
                    {formatDateTime(item.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      <Link href="/apps" className="text-sm font-medium underline">
        Browse apps
      </Link>
    </PageShell>
  );
}
