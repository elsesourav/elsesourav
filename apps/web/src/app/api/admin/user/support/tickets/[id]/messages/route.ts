import { proxyAdminRouteWithParams } from "@/lib/route-proxy";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return proxyAdminRouteWithParams(request, params, {
    service: "user",
    method: "POST",
    path: (p) => `/v1/admin/user/support/tickets/${p.id}/messages`,
  });
}
