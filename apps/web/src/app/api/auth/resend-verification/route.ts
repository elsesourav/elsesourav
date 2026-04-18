import { proxyToService } from "@/lib/service-client";

export async function POST(request: Request) {
  return proxyToService({
    request,
    service: "auth",
    method: "POST",
    path: "/v1/auth/resend-verification",
  });
}
