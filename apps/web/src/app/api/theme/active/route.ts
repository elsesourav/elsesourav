import { proxyToService } from "@/lib/service-client";

export async function GET(request: Request) {
  return proxyToService({
    request,
    service: "theme",
    method: "GET",
    path: "/v1/theme/active",
  });
}
