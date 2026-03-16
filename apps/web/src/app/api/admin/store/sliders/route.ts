import { proxyAdminRoute } from "@/lib/route-proxy";

export async function GET(request: Request) {
  return proxyAdminRoute(request, {
    service: "catalog",
    method: "GET",
    path: (incomingRequest) => {
      const url = new URL(incomingRequest.url);
      return `/v1/admin/catalog/sliders${url.search}`;
    },
  });
}

export async function POST(request: Request) {
  return proxyAdminRoute(request, {
    service: "catalog",
    method: "POST",
    path: "/v1/admin/catalog/sliders",
  });
}
