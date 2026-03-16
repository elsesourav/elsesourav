import { proxyUserRoute } from "@/lib/route-proxy";

export async function GET(request: Request) {
  return proxyUserRoute(request, {
    service: "user",
    method: "GET",
    path: "/v1/user/settings/deletion",
  });
}

export async function POST(request: Request) {
  return proxyUserRoute(request, {
    service: "user",
    method: "POST",
    path: "/v1/user/settings/deletion",
  });
}

export async function DELETE(request: Request) {
  return proxyUserRoute(request, {
    service: "user",
    method: "DELETE",
    path: "/v1/user/settings/deletion",
  });
}
