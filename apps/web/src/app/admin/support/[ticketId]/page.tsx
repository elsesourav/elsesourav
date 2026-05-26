import { requireAdminContext } from "@/lib/page-access";
import { SupportTicketDetailClient } from "./client";

export const dynamic = "force-dynamic";

export default async function AdminSupportTicketPage({
  params,
}: {
  params: Promise<{ ticketId: string }>;
}) {
  await requireAdminContext();
  const { ticketId } = await params;

  return <SupportTicketDetailClient ticketId={ticketId} />;
}
