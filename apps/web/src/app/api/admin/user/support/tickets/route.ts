import { proxyAdminRoute } from "@/lib/route-proxy";

export async function GET(request: Request) {
  return proxyAdminRoute(request, {
    service: "user",
    method: "GET",
    path: "/v1/admin/user/support/tickets",
  });
}
