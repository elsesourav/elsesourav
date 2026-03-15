import { proxyAdminRoute } from "@/lib/route-proxy";

export async function GET(request: Request) {
  return proxyAdminRoute(request, {
    service: "catalog",
    method: "GET",
    path: "/v1/admin/catalog/apps",
  });
}

export async function POST(request: Request) {
  return proxyAdminRoute(request, {
    service: "catalog",
    method: "POST",
    path: "/v1/admin/catalog/apps",
  });
}
