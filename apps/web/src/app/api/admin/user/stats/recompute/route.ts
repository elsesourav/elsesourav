import { proxyAdminRoute } from "@/lib/route-proxy";

export async function POST(request: Request) {
  return proxyAdminRoute(request, {
    service: "user",
    method: "POST",
    path: "/v1/admin/user/stats/recompute",
  });
}
