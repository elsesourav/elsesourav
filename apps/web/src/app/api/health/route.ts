import { success } from "@/lib/api-response";

export async function GET(request: Request) {
  return success(request.headers.get("x-request-id") ?? "health", {
    status: "ok",
    timestamp: new Date().toISOString(),
  });
}
