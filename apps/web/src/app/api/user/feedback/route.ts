import { proxyUserRoute } from "@/lib/route-proxy";
import { proxyToService } from "@/lib/service-client";

export async function GET(request: Request) {
  const url = new URL(request.url);

  return proxyToService({
    request,
    service: "user",
    method: "GET",
    path: `/v1/user/feedback${url.search}`,
  });
}

export async function POST(request: Request) {
  return proxyUserRoute(request, {
    service: "user",
    method: "POST",
    path: "/v1/user/feedback",
  });
}
