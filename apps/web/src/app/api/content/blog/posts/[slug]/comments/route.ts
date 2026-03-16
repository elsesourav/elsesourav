import { proxyToService } from "@/lib/service-client";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const { slug } = await context.params;

  return proxyToService({
    request,
    service: "content",
    method: "POST",
    path: `/v1/content/blog/posts/${slug}/comments`,
  });
}
