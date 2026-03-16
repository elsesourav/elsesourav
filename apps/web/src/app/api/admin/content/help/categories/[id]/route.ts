import { proxyAdminRouteWithParams } from "@/lib/route-proxy";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return proxyAdminRouteWithParams(request, params, {
    service: "content",
    method: "PATCH",
    path: ({ id }) => `/v1/admin/content/help/categories/${id}`,
  });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return proxyAdminRouteWithParams(request, params, {
    service: "content",
    method: "DELETE",
    path: ({ id }) => `/v1/admin/content/help/categories/${id}`,
  });
}
