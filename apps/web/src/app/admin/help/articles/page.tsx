import { requireAdminContext } from "@/lib/page-access";
import { fetchServiceData } from "@/lib/service-client";
import { AdminHelpArticlesClient } from "./client";

export const dynamic = "force-dynamic";

export default async function AdminHelpArticlesPage() {
  const user = await requireAdminContext();
  const res = await fetchServiceData<any>({
    service: "content",
    path: "/v1/admin/content/help/articles?limit=100",
    user,
  }).catch(() => ({ items: [] }));

  const articles = res.items || [];

  return (
    <div className="pt-4">
      <AdminHelpArticlesClient initialArticles={articles} />
    </div>
  );
}
