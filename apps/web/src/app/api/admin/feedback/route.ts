import { proxyAdminRoute } from "@/lib/route-proxy";

export async function GET(request: Request) {
  return proxyAdminRoute(request, {
    service: "user",
    method: "GET",
    path: (incomingRequest) => {
      const url = new URL(incomingRequest.url);
      return `/v1/admin/user/feedback${url.search}`;
    },
  });
}

export async function PATCH(request: Request) {
  return proxyAdminRoute(request, {
    service: "user",
    method: "PATCH",
    path: "/v1/admin/user/feedback",
  });
}
