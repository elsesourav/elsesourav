import { proxyToService } from "@/lib/service-client";

export async function GET(request: Request) {
  return proxyToService({
    request,
    service: "catalog",
    method: "GET",
    path: "/v1/catalog/categories",
  });
}
