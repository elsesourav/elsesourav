import { proxyAdminRoute } from "@/lib/route-proxy";

export async function GET(request: Request) {
  return proxyAdminRoute(request, {
    service: "auth",
    method: "GET",
    path: "/v1/auth/admin/stats",
  });
}
