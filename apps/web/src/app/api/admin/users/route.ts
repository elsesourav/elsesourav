import { proxyAdminRoute } from "@/lib/route-proxy";

export async function GET(request: Request) {
  return proxyAdminRoute(request, {
    service: "auth",
    method: "GET",
    path: "/v1/auth/admin/users",
  });
}

export async function PATCH(request: Request) {
  return proxyAdminRoute(request, {
    service: "auth",
    method: "PATCH",
    path: "/v1/auth/admin/users",
  });
}
