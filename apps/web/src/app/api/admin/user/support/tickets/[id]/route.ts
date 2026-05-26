import { proxyAdminRouteWithParams } from "@/lib/route-proxy";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return proxyAdminRouteWithParams(request, params, {
    service: "user",
    method: "GET",
    path: (p) => `/v1/admin/user/support/tickets/${p.id}`,
  });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return proxyAdminRouteWithParams(request, params, {
    service: "user",
    method: "PATCH",
    path: (p) => `/v1/admin/user/support/tickets/${p.id}`,
  });
}
