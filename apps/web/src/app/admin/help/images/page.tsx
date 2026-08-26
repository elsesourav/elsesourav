import { requireAdminContext } from "@/lib/page-access";
import { prisma } from "@elsesourav/db";
import { AdminHelpImagesClient } from "./client";

export const dynamic = "force-dynamic";

export default async function AdminHelpImagesPage() {
  await requireAdminContext();

  const helpSupportConfigs = await prisma.imageConfig.findMany({
    where: { section: "HELP_SUPPORT" },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="mt-6">
      <AdminHelpImagesClient initialConfigs={helpSupportConfigs} />
    </div>
  );
}
