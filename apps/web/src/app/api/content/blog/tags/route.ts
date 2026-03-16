import { proxyToService } from "@/lib/service-client";

export async function GET(request: Request) {
  return proxyToService({
    request,
    service: "content",
    method: "GET",
    path: "/v1/content/blog/tags",
  });
}
