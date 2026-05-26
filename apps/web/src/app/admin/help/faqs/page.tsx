import { requireAdminContext } from "@/lib/page-access";
import { fetchServiceData } from "@/lib/service-client";
import { AdminHelpFaqsClient } from "./client";

export const dynamic = "force-dynamic";

export default async function AdminHelpFaqsPage() {
  const user = await requireAdminContext();
  const res = await fetchServiceData<any>({
    service: "content",
    path: "/v1/admin/content/help/faqs",
    user,
  }).catch(() => []);

  const faqs = Array.isArray(res) ? res : [];

  return (
    <div className="pt-4">
      <AdminHelpFaqsClient initialFaqs={faqs} />
    </div>
  );
}
