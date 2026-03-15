import { proxyToService } from "@/lib/service-client";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  return proxyToService({
    request,
    service: "catalog",
    method: "GET",
    path: `/v1/catalog/apps/${slug}`,
  });
}
