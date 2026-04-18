import { proxyAdminRouteWithParams } from "@/lib/route-proxy";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return proxyAdminRouteWithParams(request, params, {
    service: "catalog",
    method: "GET",
    path: ({ id }) => `/v1/admin/catalog/apps/${id}/media`,
  });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return proxyAdminRouteWithParams(request, params, {
    service: "catalog",
    method: "POST",
    path: ({ id }) => `/v1/admin/catalog/apps/${id}/media`,
  });
}
