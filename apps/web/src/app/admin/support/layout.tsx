import { requireAdminContext } from "@/lib/page-access";
import { SupportLayoutClient } from "./layout-client";

export const dynamic = "force-dynamic";

export default async function AdminSupportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdminContext();

  return (
    <div className="h-[calc(100vh-8rem)]">
      <SupportLayoutClient>{children}</SupportLayoutClient>
    </div>
  );
}
