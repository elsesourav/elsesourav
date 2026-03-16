import { proxyAdminRoute } from "@/lib/route-proxy";

export async function GET(request: Request) {
  return proxyAdminRoute(request, {
    service: "content",
    method: "GET",
    path: "/v1/admin/content/profile",
  });
}

export async function PUT(request: Request) {
  return proxyAdminRoute(request, {
    service: "content",
    method: "PUT",
    path: "/v1/admin/content/profile",
  });
}

export async function PATCH(request: Request) {
  return proxyAdminRoute(request, {
    service: "content",
    method: "PATCH",
    path: "/v1/admin/content/profile",
  });
}
