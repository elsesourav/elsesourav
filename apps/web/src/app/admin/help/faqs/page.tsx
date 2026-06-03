import { requireAdminContext } from "@/lib/page-access";
import { fetchServiceData } from "@/lib/service-client";
import { AdminHelpFaqsClient } from "./client";

export const dynamic = "force-dynamic";

export default async function AdminHelpFaqsPage() {
  const user = await requireAdminContext();
  
  const [faqsRes, categories] = await Promise.all([
    fetchServiceData<any>({
      service: "content",
      path: "/v1/admin/content/help/faqs",
      user,
    }).catch(() => []),
    fetchServiceData<any[]>({
      service: "content",
      path: "/v1/content/help/categories",
    }).catch(() => []),
  ]);

  const faqs = faqsRes?.items || (Array.isArray(faqsRes) ? faqsRes : []);

  return (
    <div className="pt-4">
      <AdminHelpFaqsClient initialFaqs={faqs} categories={categories} />
    </div>
  );
}
