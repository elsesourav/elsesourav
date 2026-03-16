import { proxyToService } from "@/lib/service-client";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const url = new URL(request.url);

  return proxyToService({
    request,
    service: "content",
    method: "GET",
    path: `/v1/content/blog/posts/${slug}${url.search}`,
  });
}
