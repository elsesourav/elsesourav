import { proxyAdminRouteWithParams } from "@/lib/route-proxy";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return proxyAdminRouteWithParams(request, params, {
    service: "content",
    method: "PUT",
    path: ({ id }) => `/v1/admin/content/help/articles/${id}`,
  });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return proxyAdminRouteWithParams(request, params, {
    service: "content",
    method: "DELETE",
    path: ({ id }) => `/v1/admin/content/help/articles/${id}`,
  });
}
