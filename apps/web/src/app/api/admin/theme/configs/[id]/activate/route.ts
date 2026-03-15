import { proxyAdminRouteWithParams } from "@/lib/route-proxy";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return proxyAdminRouteWithParams(request, params, {
    service: "theme",
    method: "POST",
    path: ({ id }) => `/v1/admin/theme/configs/${id}/activate`,
  });
}
