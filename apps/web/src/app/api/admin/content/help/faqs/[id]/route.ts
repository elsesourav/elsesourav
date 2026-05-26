import { proxyAdminRouteWithParams } from "@/lib/route-proxy";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return proxyAdminRouteWithParams(request, params, {
    service: "content",
    method: "PATCH",
    path: (p) => `/v1/admin/content/help/faqs/${p.id}`,
  });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return proxyAdminRouteWithParams(request, params, {
    service: "content",
    method: "DELETE",
    path: (p) => `/v1/admin/content/help/faqs/${p.id}`,
  });
}
