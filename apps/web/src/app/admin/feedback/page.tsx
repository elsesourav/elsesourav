import { PageHeader } from "@/components/ui/page";
import { requireAdminContext } from "@/lib/page-access";
import { fetchServiceData } from "@/lib/service-client";
import type { AdminFeedbackItem } from "@/lib/view-models";

import { AdminFeedbackClient } from "./client";

export const dynamic = "force-dynamic";

export default async function AdminFeedbackPage() {
  const user = await requireAdminContext();
  const feedback = await fetchServiceData<AdminFeedbackItem[]>({
    service: "user",
    path: "/v1/admin/user/feedback?includeHidden=true",
    user,
  }).catch(() => []);

  return (
    <div className="space-y-4 p-4 sm:p-5 lg:p-6">
      <PageHeader
        eyebrow="People"
        title="Feedback"
        description="Moderate feedback visibility with searchable, action-ready cards."
      />

      <AdminFeedbackClient initialFeedback={feedback} />
    </div>
  );
}
