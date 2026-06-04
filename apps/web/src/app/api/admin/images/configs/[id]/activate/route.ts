import { proxyAdminRoute } from "@/lib/route-proxy";
import { NextRequest } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return proxyAdminRoute(request, {
    service: "theme",
    method: "POST",
    path: `/v1/admin/images/configs/${id}/activate`,
  });
}
