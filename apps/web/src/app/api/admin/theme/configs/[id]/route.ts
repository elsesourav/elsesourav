import { proxyAdminRouteWithParams } from "@/lib/route-proxy";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return proxyAdminRouteWithParams(request, params, {
    service: "theme",
    method: "PATCH",
    path: ({ id }) => `/v1/admin/theme/configs/${id}`,
  });
}
