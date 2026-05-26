import { proxyToService } from "@/lib/service-client";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string; commentId: string }> },
) {
  const { slug, commentId } = await params;
  return proxyToService({
    request,
    service: "content",
    method: "POST",
    path: `/v1/content/posts/${slug}/comments/${commentId}/like`,
  });
}
