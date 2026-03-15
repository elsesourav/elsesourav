import { proxyAdminRouteWithParams } from "@/lib/route-proxy";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return proxyAdminRouteWithParams(request, params, {
    service: "catalog",
    method: "PUT",
    path: ({ id }) => `/v1/admin/catalog/categories/${id}`,
  });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return proxyAdminRouteWithParams(request, params, {
    service: "catalog",
    method: "DELETE",
    path: ({ id }) => `/v1/admin/catalog/categories/${id}`,
  });
}
