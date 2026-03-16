import { proxyAdminRoute } from "@/lib/route-proxy";

export async function GET(request: Request) {
  return proxyAdminRoute(request, {
    service: "catalog",
    method: "GET",
    path: "/v1/admin/catalog/stats",
  });
}
