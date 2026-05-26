import { proxyToService } from "@/lib/service-client";
import { auth } from "@/auth";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const session = await auth();
  return proxyToService({
    request,
    service: "content",
    method: "POST",
    path: `/v1/content/posts/${slug}/bookmarks`,
    user: session?.user,
  });
}
