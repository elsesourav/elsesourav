import { proxyToService } from "@/lib/service-client";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const url = new URL(request.url);
  return proxyToService({
    request,
    service: "content",
    method: "GET",
    path: `/v1/content/posts/${slug}/related${url.search}`,
  });
}
