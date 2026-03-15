import { failure, getRequestId, hashValue, success } from "@/lib/api-response";
import { describe, expect, it } from "vitest";

describe("api-response helpers", () => {
  it("uses request x-request-id when present", () => {
    const request = new Request("http://localhost/test", {
      headers: {
        "x-request-id": "req-123",
      },
    });

    expect(getRequestId(request)).toBe("req-123");
  });

  it("creates a stable hash for the same inputs", () => {
    const one = hashValue("127.0.0.1", "secret");
    const two = hashValue("127.0.0.1", "secret");

    expect(one).toBe(two);
    expect(one.length).toBeGreaterThan(10);
  });

  it("creates success payload responses", async () => {
    const response = success("req-1", { value: 42 }, 201);
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body).toEqual({
      ok: true,
      data: { value: 42 },
      requestId: "req-1",
    });
  });

  it("creates failure payload responses", async () => {
    const response = failure("req-2", "BAD_REQUEST", "Invalid input", 400, {
      field: "name",
    });
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toEqual({
      ok: false,
      error: {
        code: "BAD_REQUEST",
        message: "Invalid input",
        details: {
          field: "name",
        },
      },
      requestId: "req-2",
    });
  });
});
