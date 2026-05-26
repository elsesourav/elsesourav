import { proxyAdminRouteWithParams } from "@/lib/route-proxy";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return proxyAdminRouteWithParams(request, params, {
    service: "content",
    method: "POST",
    path: ({ id }) => `/v1/admin/content/posts/${id}/publish`,
  });
}
