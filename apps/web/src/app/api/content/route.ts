import { proxyToService } from "@/lib/service-client";

export async function GET(request: Request) {
  const url = new URL(request.url);

  return proxyToService({
    request,
    service: "content",
    method: "GET",
    path: `/v1/content/pages${url.search}`,
  });
}
