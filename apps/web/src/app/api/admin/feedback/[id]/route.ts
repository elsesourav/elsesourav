import { proxyAdminRouteWithParams } from "@/lib/route-proxy";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return proxyAdminRouteWithParams(request, params, {
    service: "user",
    method: "PATCH",
    path: ({ id }) => `/v1/admin/user/feedback/${id}`,
  });
}
