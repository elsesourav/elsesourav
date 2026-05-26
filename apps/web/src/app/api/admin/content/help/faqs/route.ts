import { proxyAdminRoute } from "@/lib/route-proxy";

export async function GET(request: Request) {
  return proxyAdminRoute(request, {
    service: "content",
    method: "GET",
    path: "/v1/admin/content/help/faqs",
  });
}

export async function POST(request: Request) {
  return proxyAdminRoute(request, {
    service: "content",
    method: "POST",
    path: "/v1/admin/content/help/faqs",
  });
}
