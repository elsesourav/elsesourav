import { proxyUserRoute } from "@/lib/route-proxy";

export async function GET(request: Request) {
  return proxyUserRoute(request, {
    service: "user",
    method: "GET",
    path: (req) => {
      const url = new URL(req.url);
      return `/v1/user/support/tickets${url.search}`;
    },
  });
}

export async function POST(request: Request) {
  return proxyUserRoute(request, {
    service: "user",
    method: "POST",
    path: "/v1/user/support/tickets",
  });
}
