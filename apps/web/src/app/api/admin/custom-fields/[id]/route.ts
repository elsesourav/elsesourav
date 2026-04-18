import { proxyAdminRouteWithParams } from "@/lib/route-proxy";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return proxyAdminRouteWithParams(request, params, {
    service: "catalog",
    method: "PATCH",
    path: ({ id }) => `/v1/admin/catalog/custom-fields/${id}`,
  });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return proxyAdminRouteWithParams(request, params, {
    service: "catalog",
    method: "DELETE",
    path: ({ id }) => `/v1/admin/catalog/custom-fields/${id}`,
  });
}
