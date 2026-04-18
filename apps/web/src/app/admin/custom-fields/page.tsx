import { PageHeader } from "@/components/ui/page";
import { requireAdminContext } from "@/lib/page-access";
import { fetchServiceData } from "@/lib/service-client";
import type {
  AdminCustomFieldDefinition,
  AdminCustomFieldValue,
} from "@/lib/view-models";
import { AdminCustomFieldsClient } from "./client";

export const dynamic = "force-dynamic";

export default async function AdminCustomFieldsPage() {
  const user = await requireAdminContext();

  const [definitions, values] = await Promise.all([
    fetchServiceData<AdminCustomFieldDefinition[]>({
      service: "catalog",
      path: "/v1/admin/catalog/custom-fields?includeInactive=true",
      user,
    }).catch(() => []),
    fetchServiceData<AdminCustomFieldValue[]>({
      service: "catalog",
      path: "/v1/admin/catalog/custom-fields/values?limit=200",
      user,
    }).catch(() => []),
  ]);

  return (
    <div className="space-y-4 p-4 sm:p-5 lg:p-6">
      <PageHeader
        eyebrow="Catalog Extensibility"
        title="Custom fields"
        description="Define reusable schema extensions and assign values to any supported entity without database migrations."
      />

      <AdminCustomFieldsClient
        initialDefinitions={definitions}
        initialValues={values}
      />
    </div>
  );
}
