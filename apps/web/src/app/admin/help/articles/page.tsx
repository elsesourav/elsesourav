import { requireAdminContext } from "@/lib/page-access";
import { fetchServiceData } from "@/lib/service-client";
import { AdminHelpArticlesClient } from "./client";

export const dynamic = "force-dynamic";

export default async function AdminHelpArticlesPage() {
  const user = await requireAdminContext();
  
  const [articlesRes, categories] = await Promise.all([
    fetchServiceData<any>({
      service: "content",
      path: "/v1/admin/content/help/articles?limit=30",
      user,
    }).catch(() => ({ items: [] })),
    fetchServiceData<any[]>({
      service: "content",
      path: "/v1/content/help/categories",
    }).catch(() => []),
  ]);

  const articles = articlesRes.items || [];

  return (
    <div className="pt-4">
      <AdminHelpArticlesClient initialArticles={articles} categories={categories} />
    </div>
  );
}
