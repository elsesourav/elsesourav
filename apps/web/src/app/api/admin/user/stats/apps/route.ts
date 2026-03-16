import { proxyAdminRoute } from "@/lib/route-proxy";

export async function GET(request: Request) {
  return proxyAdminRoute(request, {
    service: "user",
    method: "GET",
    path: (incomingRequest) => {
      const url = new URL(incomingRequest.url);
      return `/v1/admin/user/stats/apps${url.search}`;
    },
  });
}
