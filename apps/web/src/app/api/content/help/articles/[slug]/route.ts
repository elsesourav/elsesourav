import { proxyToService } from "@/lib/service-client";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const { slug } = await context.params;

  return proxyToService({
    request,
    service: "content",
    method: "GET",
    path: `/v1/content/help/articles/${slug}`,
  });
}
