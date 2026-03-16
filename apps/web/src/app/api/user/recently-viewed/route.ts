import { proxyUserRoute } from "@/lib/route-proxy";

export async function GET(request: Request) {
  return proxyUserRoute(request, {
    service: "user",
    method: "GET",
    path: (incomingRequest) => {
      const url = new URL(incomingRequest.url);
      return `/v1/user/recently-viewed${url.search}`;
    },
  });
}
