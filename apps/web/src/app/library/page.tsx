import { PageHeader, PageShell } from "@/components/ui/page";
import { requireUserContext } from "@/lib/page-access";
import { fetchServiceData } from "@/lib/service-client";
import {
  formatDateTime,
  formatPrice,
  type UserLibraryItem,
} from "@/lib/view-models";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function LibraryPage() {
  const user = await requireUserContext();
  const items = await fetchServiceData<UserLibraryItem[]>({
    service: "user",
    path: "/v1/user/library",
    user,
  }).catch(() => []);

  return (
    <PageShell width="content" className="gap-6">
      <PageHeader
        eyebrow="Your Data"
        title="Library"
        description="Apps you bookmarked or saved."
      />

      {items.length === 0 ? (
        <p className="text-sm text-[#4a5262]">Your library is empty.</p>
      ) : (
        <section className="grid gap-3">
          {items.map((item) => (
            <article
              key={item.id}
              className="rounded-xl border border-black/15 bg-white p-4"
            >
              <p className="text-sm font-semibold text-[#111722]">
                {item.app.title}
              </p>
              <p className="text-xs text-[#4a5262]">/{item.app.slug}</p>
              <p className="mt-1 text-sm text-[#3f4757]">
                {item.app.shortDescription}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-[#4a5262]">
                <span>
                  {item.app.isPaid ? formatPrice(item.app.price) : "Free"}
                </span>
                <span>Saved {formatDateTime(item.createdAt)}</span>
              </div>
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
