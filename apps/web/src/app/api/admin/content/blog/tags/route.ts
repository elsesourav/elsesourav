import { proxyAdminRoute } from "@/lib/route-proxy";

export async function GET(request: Request) {
  return proxyAdminRoute(request, {
    service: "content",
    method: "GET",
    path: "/v1/admin/content/blog/tags",
  });
}

export async function POST(request: Request) {
  return proxyAdminRoute(request, {
    service: "content",
    method: "POST",
    path: "/v1/admin/content/blog/tags",
  });
}
