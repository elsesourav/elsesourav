import { proxyAdminRouteWithParams } from "@/lib/route-proxy";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; mediaId: string }> },
) {
  return proxyAdminRouteWithParams(request, params, {
    service: "catalog",
    method: "PATCH",
    path: ({ id, mediaId }) => `/v1/admin/catalog/apps/${id}/media/${mediaId}`,
  });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; mediaId: string }> },
) {
  return proxyAdminRouteWithParams(request, params, {
    service: "catalog",
    method: "DELETE",
    path: ({ id, mediaId }) => `/v1/admin/catalog/apps/${id}/media/${mediaId}`,
  });
}
