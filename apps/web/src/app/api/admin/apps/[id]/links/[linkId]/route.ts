import { proxyAdminRouteWithParams } from "@/lib/route-proxy";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; linkId: string }> },
) {
  return proxyAdminRouteWithParams(request, params, {
    service: "catalog",
    method: "PATCH",
    path: ({ id, linkId }) => `/v1/admin/catalog/apps/${id}/links/${linkId}`,
  });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; linkId: string }> },
) {
  return proxyAdminRouteWithParams(request, params, {
    service: "catalog",
    method: "DELETE",
    path: ({ id, linkId }) => `/v1/admin/catalog/apps/${id}/links/${linkId}`,
  });
}
