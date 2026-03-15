import { proxyAdminRoute } from "@/lib/route-proxy";

export async function GET(request: Request) {
  return proxyAdminRoute(request, {
    service: "theme",
    method: "GET",
    path: "/v1/admin/theme/configs",
  });
}

export async function POST(request: Request) {
  return proxyAdminRoute(request, {
    service: "theme",
    method: "POST",
    path: "/v1/admin/theme/configs",
  });
}
