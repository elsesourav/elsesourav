import { proxyUserRoute } from "@/lib/route-proxy";

export async function GET(request: Request) {
  return proxyUserRoute(request, {
    service: "user",
    method: "GET",
    path: "/v1/user/settings",
  });
}

export async function PATCH(request: Request) {
  return proxyUserRoute(request, {
    service: "user",
    method: "PATCH",
    path: "/v1/user/settings",
  });
}
