import { auth } from "@/auth";
import { proxyToService } from "@/lib/service-client";

export async function POST(request: Request) {
  const session = await auth();

  return proxyToService({
    request,
    service: "user",
    method: "POST",
    path: "/v1/user/download/track",
    user: {
      id: session?.user?.id,
      role: session?.user?.role,
    },
  });
}
